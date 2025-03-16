import { afterAll, beforeAll, describe, it } from "@jest/globals";
import dbConnect from "@/lib/database/dbConnect";
import mongoose from "mongoose";
import { expect } from "@jest/globals";
import { NextRequest } from "next/server";
import { DELETE } from "@/app/api/surveys/[id]/route"; // Passe den Pfad entsprechend an
import Survey from "@/lib/models/Survey"; // Passe den Pfad entsprechend an

// Mock der getUserID-Funktion, um den Test-Benutzer zurückzugeben
const mockUserId = new mongoose.Types.ObjectId();
jest.mock("@/lib/helper", () => ({
    getUserID: () => ({ id: mockUserId, error: null, status: 200 }),
}));

describe("Integration Test: DELETE Survey endpoint", () => {
    let surveyId: string;

    beforeAll(async () => {
        await dbConnect();
        let retries = 0;
        while (mongoose.connection.readyState !== 1 && retries < 10) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries++;
        }
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Mongoose-Verbindung konnte nicht hergestellt werden.");
        }

        // Erstelle eine Test-Umfrage, die später gelöscht wird
        const testSurvey = new Survey({
            title: "Delete Survey Integration Test",
            description: "This is a delete test survey",
            options: [{ title: "Option 1" }],
            dateTimeSelections: [
                {
                    date: "2025-01-01",
                    timeSlots: [{ startTime: "10:00", endTime: "11:00" }],
                },
            ],
            expiresAt: "2025-12-31",
            location: "Test Location",
            status: "aktiv",
            participants: [],
            creator: mockUserId, // Setze die ID des Test-Benutzers
        });

        const savedSurvey = await testSurvey.save();
        surveyId = savedSurvey._id.toString();
    });

    afterAll(async () => {
        await Survey.deleteMany({ _id: surveyId }); // Lösche Test-Survey
        await mongoose.disconnect();
    });

    it("should successfully delete a survey", async () => {
        // Mock des NextRequest-Objekts
        const req = new NextRequest("http://localhost:3000/api/surveys/" + surveyId, {
            method: "DELETE",
        });

        // Mock der Parameter
        const params = Promise.resolve({ id: surveyId });

        // Führe die DELETE-Funktion aus
        const response = await DELETE(req, { params });

        // Überprüfe die Antwort
        expect(response.status).toBe(200);
        const responseBody = await response.json();
        expect(responseBody.message).toBe("Die Umfrage wurde erfolgreich gelöscht.");

        // Überprüfe, ob die Umfrage tatsächlich gelöscht wurde
        const deletedSurvey = await Survey.findById(surveyId);
        expect(deletedSurvey).toBeNull();
    });

    it("should return 400 if survey id is not provided", async () => {
        // Mock des NextRequest-Objekts
        const req = new NextRequest("http://localhost:3000/api/surveys/", {
            method: "DELETE",
        });

        // Mock der Parameter
        const params = Promise.resolve({ id: "" });

        // Führe die DELETE-Funktion aus
        const response = await DELETE(req, { params });

        // Überprüfe die Antwort
        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.message).toBe("Umfrage-Id muss angegeben werden.");
    });

    it("should return 400 if survey-id is invalid", async () => {
        // Mock des NextRequest-Objekts
        const req = new NextRequest("http://localhost:3000/api/surveys/" + "invalidSurveyId", {
            method: "DELETE",
        });

        // Mock der Parameter (mit einer nicht existierenden Umfrage-ID)
        const params = Promise.resolve({ id: "invalidSurveyId" });

        // Führe die DELETE-Funktion aus
        const response = await DELETE(req, { params });

        // Überprüfe die Antwort
        expect(response.status).toBe(400);
        const responseBody = await response.json();
        expect(responseBody.message).toBe("Ungültige Umfrage-Id.");
    });

    it("should return 404 if survey was not found", async () => {
        const surveyToDelete = new mongoose.Types.ObjectId().toString();
        // Mock des NextRequest-Objekts
        const req = new NextRequest("http://localhost:3000/api/surveys/" + surveyToDelete, {
            method: "DELETE",
        });

        // Mock der Parameter (mit einer nicht existierenden Umfrage-ID)
        const params = Promise.resolve({ id: surveyToDelete });

        // Führe die DELETE-Funktion aus
        const response = await DELETE(req, { params });

        // Überprüfe die Antwort
        expect(response.status).toBe(404);
        const responseBody = await response.json();
        expect(responseBody.message).toBe("Umfrage nicht gefunden.");
    });

    it("should return 403 if user is not the creator of the survey", async () => {
        // Mock der getUserID-Funktion, um einen anderen Benutzer zurückzugeben
        const anotherUserId = new mongoose.Types.ObjectId(); // Erstelle eine andere Benutzer-ID
        jest.spyOn(require("@/lib/helper"), "getUserID").mockResolvedValue({
            id: anotherUserId, // Simuliere einen anderen Benutzer (nicht der Ersteller)
            error: null,
            status: 200,
        });

        // Mock des NextRequest-Objekts
        const req = new NextRequest("http://localhost:3000/api/surveys/" + surveyId, {
            method: "DELETE",
        });

        // Mock der Parameter
        const params = Promise.resolve({ id: surveyId });

        // Führe die DELETE-Funktion aus
        const response = await DELETE(req, { params });

        // Überprüfe die Antwort
        expect(response.status).toBe(403);
        const responseBody = await response.json();
        expect(responseBody.message).toBe("Du bist nicht der Ersteller der Umfrage.");

        // Überprüfe, ob die Umfrage NICHT gelöscht wurde
        const survey = await Survey.findById(surveyId);
        expect(survey).not.toBeNull();
    });

    it("should return 401 if user is not authenticated", async () => {
        // Mock der getUserID-Funktion, um einen Fehler zurückzugeben
        jest.spyOn(require("@/lib/helper"), "getUserID").mockResolvedValue({
            id: null,
            error: "Nicht authentifiziert",
            status: 401
        });

        // Mock des NextRequest-Objekts
        const req = new NextRequest("http://localhost:3000/api/surveys/" + surveyId, {
            method: "DELETE",
        });

        // Mock der Parameter
        const params = Promise.resolve({ id: surveyId });

        // Führe die DELETE-Funktion aus
        const response = await DELETE(req, { params });

        // Überprüfe die Antwort
        expect(response.status).toBe(401);
        const responseBody = await response.json();
        expect(responseBody.message).toBe("Nicht authentifiziert");
    });
});