import { DELETE } from "@/app/api/surveys/[id]/route";
import { getUserID } from "@/lib/helper";
import Survey from "@/lib/models/Survey";
import dbConnect from "@/lib/database/dbConnect";
import { beforeEach, describe, expect, test } from '@jest/globals';

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Survey");
jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
}));

describe("Surveys API Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("DELETE /api/surveys/[id]", () => {
        const mockUserId = "user123";
        const mockSurveyId = "survey123";
        const request = { method: "DELETE", headers: {} };

        test("should return 200 if the survey is successfully deleted", async () => {
            (dbConnect as jest.Mock).mockResolvedValue(undefined);
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            (Survey.findOneAndDelete as jest.Mock).mockResolvedValue({ _id: mockSurveyId, creator: mockUserId });

            const expectedResponseMessage = { message: "Die Umfrage wurde erfolgreich gelöscht." };
            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            expect(Survey.findOneAndDelete).toHaveBeenCalledWith({ _id: mockSurveyId, creator: mockUserId });
            expect(await response.json()).toEqual(expectedResponseMessage);
            expect(response.status).toBe(200);
        });

        test("should return 400 if no survey id is provided", async () => {
            (dbConnect as jest.Mock).mockResolvedValue(undefined);
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            const expectedResponseMessage = { message: "Umfrage-Id muss angegeben werden" };
            const params = { params: Promise.resolve({ id: "" }) }; // no id provided
            const response = await DELETE(request as never, params);

            expect(await response.json()).toEqual(expectedResponseMessage);
            expect(response.status).toBe(400);
        });

        test("should return 404 if the survey is not found or user is not the creator", async () => {
            (dbConnect as jest.Mock).mockResolvedValue(undefined);
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            (Survey.findOneAndDelete as jest.Mock).mockResolvedValue(null); // Survey not found

            const expectedResponseMessage = { message: "Umfrage nicht gefunden oder du bist nicht der Ersteller." }
            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            expect(await response.json()).toEqual(expectedResponseMessage);
            expect(response.status).toBe(404);
        });

        test("should return 500 if an error occurs during deletion", async () => {
            (dbConnect as jest.Mock).mockResolvedValue(undefined);
            (getUserID as jest.Mock).mockResolvedValue({ id: mockUserId });

            (Survey.findOneAndDelete as jest.Mock).mockRejectedValue(new Error("Some error")); // Simulating error

            const expectedResponseMessage = "Internal Server Error";
            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            const jsonResponse = await response.json();

            expect(jsonResponse.message).toBe(expectedResponseMessage);
            expect(response.status).toBe(500);
        });

        test("should return 401 if the user is not authenticated", async () => {
            (dbConnect as jest.Mock).mockResolvedValue(undefined);
            (getUserID as jest.Mock).mockResolvedValue({ error: "Unauthorized", status: 401 });

            const expectedResponseMessage = { message: "Unauthorized" };
            const params = { params: Promise.resolve({ id: mockSurveyId }) };
            const response = await DELETE(request as never, params);

            expect(await response.json()).toEqual(expectedResponseMessage);
            expect(response.status).toBe(401);
        });
    });
});
