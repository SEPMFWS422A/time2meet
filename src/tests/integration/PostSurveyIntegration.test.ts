import { POST } from "@/app/api/surveys/route";
import dbConnect from "@/lib/database/dbConnect";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest} from "next/server";
import mongoose, { ObjectId } from "mongoose";
import Survey from "@/lib/models/Survey";
import { ISurveyPostBody } from "@/lib/interfaces/ISurveyPostBody";


jest.mock("@/lib/helper", () => {
    const mongoose = require("mongoose"); 
    const mockUserId = new mongoose.Types.ObjectId(); 
    return {
        getUserID: jest.fn().mockResolvedValue({
            id: mockUserId,
            error: null,
            status: 200
        }),
    };
});

const mockSurvey: ISurveyPostBody = {
    "title": "Survey-Test5",
    "description": "Bitte wählt eure bevorzugten Termine und Optionen für das Teamevent aus.",
    "options": [
        {"title": "Bowling"},
        {"title": "Kartfahren"}
    ],
    "dateTimeSelections": [
        {
            "date": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "timeSlots": [
                {
                    "startTime": "18:00",
                    "endTime": "22:00"
                },
                {
                    "startTime": "19:00",
                    "endTime": "20:00"
                }
            ]
        },
        {
            "date": new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "timeSlots": [
                {
                    "startTime": "18:00",
                    "endTime": "19:00"
                },
                {
                    "startTime": "19:00",
                    "endTime": "20:00"
                }
            ]
        }
    ],
    "expiresAt": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    "location": "Düsseldorf",
    "status": "aktiv",
    "participants": [] 
};

describe("Integration Test: Post Survey endpoint", () => {
    let createdSurveyId: ObjectId 

    beforeAll(async () => {
        await dbConnect();
        let retries = 0;
        while (mongoose.connection.readyState !== 1 && retries < 10) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries++;
        }
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Mongoose-Verbindung konnte nicht verbinden.");
        }
        if (createdSurveyId) {
            await Survey.findByIdAndDelete(createdSurveyId);
        }
    });

    afterAll(async () => {
        if (createdSurveyId) {
            await Survey.findByIdAndDelete(createdSurveyId).exec();
        }
        await mongoose.disconnect();
    });
    beforeEach(()=>{
        jest.restoreAllMocks();
    })

    it("should create a new survey and return 201 status code", async () => {
        const req = new NextRequest("http://localhost:3000/api/surveys", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer mockToken"
            },
            body: JSON.stringify(mockSurvey)
        });

        const response = await POST(req);

        expect(response.status).toBe(201);

        const responseBody = await response.json();

        expect(responseBody.message).toBe("Umfrage erfolgreich erstellt");

        const savedSurvey = await Survey.findOne({ title: mockSurvey.title });
        expect(savedSurvey).toBeDefined();
        expect(savedSurvey?.title).toBe(mockSurvey.title);
        expect(savedSurvey?.description).toBe(mockSurvey.description);

        createdSurveyId = savedSurvey?._id;
    });

    it("should return 400 status code when false mock survey enters", async () => {

        const InvalidSurveyMock={
        "description": "Bitte wählt eure bevorzugten Termine und Optionen für das Teamevent aus.",
        "options": [
            {"title": "Bowling"},
            {"title": "Kartfahren"}
                   ],
             }
        const req = new NextRequest("http://localhost:3000/api/surveys", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer mockToken"
            },
            body: JSON.stringify(InvalidSurveyMock)
        });

        const response = await POST(req);

        expect(response.status).toBe(400);

        const responseBody = await response.json();

        expect(responseBody.message).toBe("Validierungsfehler");

    });
    
    it("should return 500 status code when an internal server error occurs", async () => {
        jest.spyOn(Survey.prototype, "save").mockRejectedValueOnce(new Error("Database save failed"));
    
        const req = new NextRequest("http://localhost:3000/api/surveys", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer mockToken"
            },
            body: JSON.stringify(mockSurvey)
        });
    
        const response = await POST(req);
    
        expect(response.status).toBe(500);
    
        const responseBody = await response.json();
    
        expect(responseBody.message).toBe("Interner Serverfehler");
        expect(responseBody.error).toBe("Database save failed"); 
    });

    it("should return 401 status code when no UserId is there", async () => {

        jest.spyOn(require("@/lib/helper"), "getUserID").mockResolvedValue({
            id: null,
            error: "Unauthorized",
            status: 401
        });

        const req = new NextRequest("http://localhost:3000/api/surveys", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer mockToken"
            },
            body: JSON.stringify(mockSurvey)
        });

        const response = await POST(req);

        expect(response.status).toBe(401);

        const responseBody = await response.json();

        expect(responseBody.message).toBe("Unauthorized");

    });
});
