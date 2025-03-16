import { GET, POST } from "@/app/api/events/route";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import { expect, describe, it, beforeEach } from "@jest/globals";

// Mock the fetch function for the authentication API call
global.fetch = jest.fn();

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Event");
jest.mock("@/lib/models/User");

describe("Events API Route", () => {
    const mockRequest = {
        headers: {
            get: jest.fn().mockReturnValue("session=test-cookie"),
        },
        cookies: {
            get: jest.fn(),
        },
        json: jest.fn(),
    } as unknown as NextRequest;

    const mockUser = {
        _id: "user123",
        vorname: "Max",
        name: "Muster",
        benutzername: "maxm"
    };

    const mockEvents = [
        {
            _id: "event1",
            title: "Meeting",
            start: "2025-03-15T10:00:00",
            end: "2025-03-15T11:00:00",
            description: "Wöchentliches Meeting",
            location: "Büro",
            allday: false,
            creator: { _id: "user123", vorname: "Max", name: "Muster", benutzername: "maxm" },
            members: [{ _id: "user124", vorname: "Lisa", name: "Beispiel", benutzername: "lisab" }],
            groups: [{ _id: "group1", groupname: "Dev Team", beschreibung: "Entwicklungsteam" }],
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (dbConnect as jest.Mock).mockResolvedValue(true);

        // Mock the authentication API response
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ id: "user123" })
        });

        // Mock User.findById
        (User.findById as jest.Mock).mockResolvedValue(mockUser);

        // Mock Event.find
        (Event.find as jest.Mock).mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockEvents),
        }));
    });

    describe("GET", () => {
        it("should return events for the authenticated user", async () => {
            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toEqual(mockEvents);
        });

        it("should return empty array if no events are found", async () => {
            (Event.find as jest.Mock).mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([]),
            }));

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.data).toEqual([]);
            expect(data.message).toBe("Keine Events gefunden.");
        });

        it("should return error when authentication fails", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                json: jest.fn().mockResolvedValue({ error: "Authentifizierungsfehler" })
            });

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Authentifizierungsfehler");
        });

        it("should return error when no cookie is present", async () => {
            (mockRequest.headers.get as jest.Mock).mockReturnValue(null);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Keine Authentifizierung vorhanden");
        });

        it("should return error when user is not found", async () => {
            (User.findById as jest.Mock).mockResolvedValue(null);

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Benutzer nicht gefunden");
        });

        it("should return error on database error", async () => {
            (Event.find as jest.Mock).mockImplementation(() => {
                throw new Error("Datenbankfehler");
            });

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Datenbankfehler");
        });
    });

    describe("POST", () => {
        const mockEventData = {
            title: "Team Meeting",
            start: "2025-04-01T09:00:00",
            end: "2025-04-01T10:00:00",
            description: "Wöchentliches Team-Meeting",
            location: "Zoom",
            allday: false,
            members: ["user124"],
            groups: ["group1"],
        };

        beforeEach(() => {
            (mockRequest.json as jest.Mock).mockResolvedValue(mockEventData);
            (Event.prototype.save as jest.Mock) = jest.fn().mockResolvedValue({
                _id: "eventNew",
                ...mockEventData,
                creator: "user123"
            });
        });

        it("should create a new event successfully", async () => {
            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data).toEqual({
                _id: "eventNew",
                ...mockEventData,
                creator: "user123"
            });
            expect(Event).toHaveBeenCalledWith({
                ...mockEventData,
                creator: "user123"
            });
        });

        it("should return 400 if required fields are missing", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue({
                // Missing title and start
                end: "2025-04-01T10:00:00",
                description: "Wöchentliches Team-Meeting",
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Title und Start-Datum sind erforderlich.");
        });

        it("should return error when authentication fails", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                json: jest.fn().mockResolvedValue({ error: "Authentifizierungsfehler" })
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Authentifizierungsfehler");
        });

        it("should return 500 on event creation error", async () => {
            (Event.prototype.save as jest.Mock) = jest.fn().mockImplementation(() => {
                throw new Error("Datenbankfehler");
            });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Fehler beim Erstellen des Events: Datenbankfehler");
        });
    });
});