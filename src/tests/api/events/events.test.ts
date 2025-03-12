import { GET, POST } from "@/app/api/events/route";
import { NextRequest } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import { getUserID } from "@/lib/helper";
import { expect, describe, it, beforeEach } from "@jest/globals";

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Event");
jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
}));

describe("Events API Route", () => {
    const mockRequest = {
        cookies: {
            get: jest.fn(),
        },
        json: jest.fn(),
    } as unknown as NextRequest;

    const mockUser = {
        id: "user123",
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
        (getUserID as jest.Mock).mockResolvedValue(mockUser);
        (Event.find as jest.Mock).mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue(mockEvents),
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

        it("should return 404 if no events are found", async () => {
            (Event.find as jest.Mock).mockImplementation(() => ({
                populate: jest.fn().mockReturnThis(),
                select: jest.fn().mockResolvedValue([]),
                lean: jest.fn().mockResolvedValue([]),
            }));

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(404);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Keine Events gefunden.");
        });

        it("should return error when user is not authenticated", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ error: "Nicht authentifiziert", status: 401 });

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Nicht authentifiziert");
        });

        it("should return 500 on database error", async () => {
            (Event.find as jest.Mock).mockRejectedValue(new Error("Datenbankfehler"));

            const response = await GET(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
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

        it("should create a new event successfully", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue(mockEventData);
            (Event.create as jest.Mock).mockResolvedValue({ _id: "eventNew", ...mockEventData });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(201);
            expect(data.success).toBe(true);
            expect(data.data).toEqual({ _id: "eventNew", ...mockEventData });
        });

        it("should return 400 if required fields are missing", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue({});

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(400);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Title und Start-Datum sind erforderlich.");
        });

        it("should return error when user is not authenticated", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ error: "Nicht authentifiziert", status: 401 });

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Nicht authentifiziert");
        });

        it("should return 500 on event creation error", async () => {
            (mockRequest.json as jest.Mock).mockResolvedValue(mockEventData);
            (Event.create as jest.Mock).mockRejectedValue(new Error("Datenbankfehler"));

            const response = await POST(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.success).toBe(false);
            expect(data.error).toBe("Fehler beim Erstellen des Events: Datenbankfehler");
        });
    });
});
