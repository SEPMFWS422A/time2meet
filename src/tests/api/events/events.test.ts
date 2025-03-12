import { GET, POST } from "@/app/api/events/route";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import { expect, describe, it, beforeEach } from "@jest/globals";

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Event");

describe("Events API Route", () => {
    const mockRequest = {
        json: jest.fn(),
    } as unknown as NextRequest;

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

        const mockEventQuery = {
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockEvents),
        };

        // `find()` gibt das Mock-Objekt zurück, das `.populate()` und `.select()` erlaubt
        (Event.find as jest.Mock).mockImplementation(() => mockEventQuery);
    });


    describe("GET", () => {
        it("should return all events with populated fields", async () => {
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data).toEqual(mockEvents);
        });

        it("should return 404 if no events are found", async () => {
            (Event.find as jest.Mock).mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue([]),
            }));

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data).toEqual({ error: "Keine Events gefunden." });
        });

        it("should return 500 on database error", async () => {
            (Event.find as jest.Mock).mockRejectedValue(new Error("Datenbankfehler"));

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: "Fehler beim Abrufen der Events." });
        });
    });

    describe("POST", () => {
        const mockEventData = {
            creator: "user123",
            title: "Team Meeting",
            start: "2025-04-01T09:00:00",
            end: "2025-04-01T10:00:00",
            description: "Wöchentliches Team-Meeting",
            location: "Zoom",
            allday: false,
            members: ["user124"],
            groups: ["group1"],
        };

        it("should create a new event successfully", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue(mockEventData);
            (Event.create as jest.Mock).mockResolvedValue({ _id: "eventNew", ...mockEventData });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data).toEqual({ _id: "eventNew", ...mockEventData });
        });

        it("should return 400 if required fields are missing", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue({});

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data).toEqual({ error: "creator, title und start sind erforderlich." });
        });

        it("should return 500 on event creation error", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue(mockEventData);
            (Event.create as jest.Mock).mockRejectedValue(new Error("Datenbankfehler"));

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data).toEqual({ error: "Fehler beim Erstellen des Events: Datenbankfehler" });
        });
    });
});
