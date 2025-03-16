import { GET } from "@/app/api/events/[id]/route";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import { expect, describe, it, beforeEach } from "@jest/globals";
import mongoose from "mongoose";

// Mock the fetch function for the authentication API call
global.fetch = jest.fn();

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Event");
jest.mock("@/lib/models/User");

describe("GET /api/events/:id API Route", () => {
    const mockRequest = {
        headers: {
            get: jest.fn().mockReturnValue("session=test-cookie"),
        },
        nextUrl: {
            searchParams: {
                get: jest.fn(),
            },
        },
    } as unknown as NextRequest;

    const currentUser = {
        _id: new mongoose.Types.ObjectId("user123"),
        vorname: "Max",
        name: "Muster",
        benutzername: "maxm"
    };

    const targetUser = {
        _id: new mongoose.Types.ObjectId("user456"),
        vorname: "Lisa",
        name: "Beispiel",
        benutzername: "lisab"
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
            members: [{ _id: "user456", vorname: "Lisa", name: "Beispiel", benutzername: "lisab" }],
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

        // Reset search params
        (mockRequest.nextUrl.searchParams.get as jest.Mock).mockImplementation((param) => null);

        // Mock User.findById
        (User.findById as jest.Mock).mockImplementation((id) => {
            if (id.toString() === "user123") {
                return Promise.resolve(currentUser);
            } else if (id.toString() === "user456") {
                return Promise.resolve(targetUser);
            }
            return Promise.resolve(null);
        });

        // Mock Event.find
        (Event.find as jest.Mock).mockImplementation(() => ({
            populate: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(mockEvents),
        }));
    });

    it("should return events when user requests their own events", async () => {
        const response = await GET(mockRequest, { params: { id: "user123" } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toEqual(mockEvents);
        expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
            $or: expect.arrayContaining([
                { creator: "user123" },
                { members: "user123" }
            ])
        }));
    });

    it("should return shared events when user requests another user's events", async () => {
        const response = await GET(mockRequest, { params: { id: "user456" } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toEqual(mockEvents);
        expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
            $and: expect.arrayContaining([
                expect.objectContaining({
                    $or: expect.arrayContaining([
                        { creator: "user456" },
                        { members: "user456" }
                    ])
                }),
                { members: currentUser._id }
            ])
        }));
    });

    it("should filter events by date range when start and end parameters are provided", async () => {
        (mockRequest.nextUrl.searchParams.get as jest.Mock).mockImplementation((param) => {
            if (param === "start") return "2025-03-01";
            if (param === "end") return "2025-03-31";
            return null;
        });

        await GET(mockRequest, { params: { id: "user123" } });

        expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
            start: { $gte: expect.any(Date) },
            end: { $lte: expect.any(Date) }
        }));
    });

    it("should return 404 if user is not found", async () => {
        (User.findById as jest.Mock).mockResolvedValue(null);

        const response = await GET(mockRequest, { params: { id: "nonexistent" } });
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Benutzer nicht gefunden.");
    });

    it("should return error when authentication fails", async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
            json: jest.fn().mockResolvedValue({ error: "Authentifizierungsfehler" })
        });

        const response = await GET(mockRequest, { params: { id: "user123" } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Authentifizierungsfehler");
    });

    it("should return error when no cookie is present", async () => {
        (mockRequest.headers.get as jest.Mock).mockReturnValue(null);

        const response = await GET(mockRequest, { params: { id: "user123" } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Keine Authentifizierung vorhanden");
    });

    it("should handle start parameter without end parameter", async () => {
        (mockRequest.nextUrl.searchParams.get as jest.Mock).mockImplementation((param) => {
            if (param === "start") return "2025-03-01";
            return null;
        });

        await GET(mockRequest, { params: { id: "user123" } });

        expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
            start: { $gte: expect.any(Date) },
            end: {}
        }));
    });

    it("should handle end parameter without start parameter", async () => {
        (mockRequest.nextUrl.searchParams.get as jest.Mock).mockImplementation((param) => {
            if (param === "end") return "2025-03-31";
            return null;
        });

        await GET(mockRequest, { params: { id: "user123" } });

        expect(Event.find).toHaveBeenCalledWith(expect.objectContaining({
            start: {},
            end: { $lte: expect.any(Date) }
        }));
    });

    it("should return 500 if database query fails", async () => {
        (Event.find as jest.Mock).mockImplementation(() => {
            throw new Error("Database error");
        });

        const response = await GET(mockRequest, { params: { id: "user123" } });
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Database error");
    });
});