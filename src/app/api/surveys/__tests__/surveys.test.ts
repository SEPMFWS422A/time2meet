import { DELETE } from "@/app/api/surveys/[id]/route";
import { getUserID } from "@/lib/helper";
import Survey from "@/lib/models/Survey";
import dbConnect from "@/lib/database/dbConnect";
import { beforeEach, describe, expect, test } from '@jest/globals';
import mongoose from 'mongoose';

// Mocking der Abhängigkeiten
jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Survey");
jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
}));

describe("Surveys API Tests", () => {
    const mockUserId = "user123";
    const mockSurveyId = new mongoose.Types.ObjectId().toString(); // Gültige MongoDB-ObjectId
    const mockInvalidSurveyId = "invalidId"; // Ungültige ID
    const request = { method: "DELETE", headers: {} };

    beforeEach(() => {
        jest.clearAllMocks();
        (dbConnect as jest.Mock).mockResolvedValue(undefined);
    });

    describe("DELETE /api/surveys/[id]", () => {
        test("should return 200 if the survey is successfully deleted", async () => {
            // Mock für einen authentifizierten Benutzer
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            // Mock für eine erfolgreiche Umfrage-Suche und Löschung
            const mockSurvey = {
                _id: mockSurveyId,
                creator: mockUserId,
            };
            (Survey.findById as jest.Mock).mockResolvedValue(mockSurvey);
            (Survey.findByIdAndDelete as jest.Mock).mockResolvedValue(mockSurvey);

            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            expect(Survey.findById).toHaveBeenCalledWith(mockSurveyId);
            expect(Survey.findByIdAndDelete).toHaveBeenCalledWith(mockSurveyId);
            expect(await response.json()).toEqual({ message: "Die Umfrage wurde erfolgreich gelöscht." });
            expect(response.status).toBe(200);
        });

        test("should return 400 if no survey id is provided", async () => {
            // Mock für einen authentifizierten Benutzer
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            const params = { params: Promise.resolve({ id: "" }) }; // Keine ID angegeben
            const response = await DELETE(request as never, params);

            expect(await response.json()).toEqual({ message: "Umfrage-Id muss angegeben werden." });
            expect(response.status).toBe(400);
        });

        test("should return 400 if the survey id is invalid", async () => {
            // Mock für einen authentifizierten Benutzer
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            const params = { params: Promise.resolve({ id: mockInvalidSurveyId }) }; // Ungültige ID
            const response = await DELETE(request as never, params);

            expect(await response.json()).toEqual({ message: "Ungültige Umfrage-Id." });
            expect(response.status).toBe(400);
        });

        test("should return 404 if the survey is not found", async () => {
            // Mock für einen authentifizierten Benutzer
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            // Mock für eine nicht gefundene Umfrage
            (Survey.findById as jest.Mock).mockResolvedValue(null);

            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            expect(Survey.findById).toHaveBeenCalledWith(mockSurveyId);
            expect(await response.json()).toEqual({ message: "Umfrage nicht gefunden." });
            expect(response.status).toBe(404);
        });

        test("should return 403 if the user is not the creator of the survey", async () => {
            // Mock für einen authentifizierten Benutzer
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            // Mock für eine Umfrage, die einem anderen Benutzer gehört
            const mockSurvey = {
                _id: mockSurveyId,
                creator: "anotherUser",
            };
            (Survey.findById as jest.Mock).mockResolvedValue(mockSurvey);

            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            expect(Survey.findById).toHaveBeenCalledWith(mockSurveyId);
            expect(await response.json()).toEqual({ message: "Du bist nicht der Ersteller der Umfrage." });
            expect(response.status).toBe(403);
        });

        test("should return 500 if an error occurs during deletion", async () => {
            // Mock für einen authentifizierten Benutzer
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            // Mock für einen Fehler beim Löschen der Umfrage
            (Survey.findById as jest.Mock).mockRejectedValue(new Error("Some error"));

            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            expect(Survey.findById).toHaveBeenCalledWith(mockSurveyId);
            expect(await response.json()).toEqual({ message: "Internal Server Error" });
            expect(response.status).toBe(500);
        });

        test("should return 401 if the user is not authenticated", async () => {
            // Mock für einen nicht authentifizierten Benutzer
            (getUserID as jest.Mock).mockResolvedValue({ error: "Unauthorized", status: 401 });

            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            expect(await response.json()).toEqual({ message: "Unauthorized" });
            expect(response.status).toBe(401);
        });
    });
});