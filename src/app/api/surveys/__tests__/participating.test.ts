import { GET } from "@/app/api/surveys/participating/route";
import { mockDeep } from "jest-mock-extended";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Survey from "@/lib/models/Survey";
import { getUserID } from "@/lib/helper";

const { expect, describe, it } = require('@jest/globals');

// Mock NextResponse
jest.mock("next/server", () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({ json: () => Promise.resolve(data), status: options?.status || 200 })),
    },
}));

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Survey");
jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
}));

describe("API Routes: Participating Surveys", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

        it("should return surveys where the user is participating", async () => {
            
            (dbConnect as jest.Mock).mockResolvedValue(undefined);
            (getUserID as jest.Mock).mockResolvedValue({ id: "user123", error: null });
            
            
            const mockSurveys = [
                { _id: "survey1", title: "Survey 1", participants: ["user123", "otherUser"] },
                { _id: "survey2", title: "Survey 2", participants: ["anotherUser"] },
                { _id: "survey3", title: "Survey 3", participants: ["user123"] }
            ];
            
            (Survey.find as jest.Mock).mockReturnValueOnce({
                lean: jest.fn().mockResolvedValue(mockSurveys)
            });

            // Create mock request
            const mockReq = mockDeep<NextRequest>();

            // Execute the API route
            const response = await GET(mockReq);
            const jsonResponse = await response.json();

            // Assertions
            expect(dbConnect).toHaveBeenCalled();
            expect(getUserID).toHaveBeenCalledWith(mockReq);
            expect(Survey.find).toHaveBeenCalled();
            
            // Should only return surveys where user123 is a participant
            expect(jsonResponse).toHaveLength(2);
            expect(jsonResponse[0]._id).toBe("survey1");
            expect(jsonResponse[1]._id).toBe("survey3");
        });

        it("should return an error if user authentication fails", async () => {
            (dbConnect as jest.Mock).mockResolvedValue(undefined);
            (getUserID as jest.Mock).mockResolvedValue({ error: "Unauthorized", status: 401 });

            const mockReq = mockDeep<NextRequest>();

            const response = await GET(mockReq);
            const jsonResponse = await response.json();

            expect(response.status).toBe(401);
            expect(jsonResponse.message).toBe("Unauthorized");
            expect(Survey.find).not.toHaveBeenCalled();
        });

        it("should return a 500 error when an exception occurs", async () => {
            (dbConnect as jest.Mock).mockResolvedValue(undefined);
            (getUserID as jest.Mock).mockResolvedValue({ id: "user123", error: null });
            
            (Survey.find as jest.Mock).mockImplementation(() => {
                throw new Error("Database error");
            });

            const mockReq = mockDeep<NextRequest>();

            const response = await GET(mockReq);
            const jsonResponse = await response.json();

        
            expect(response.status).toBe(500);
            expect(jsonResponse.message).toBe("Internal Server Error");
            expect(jsonResponse.error).toBeDefined();
        });
});