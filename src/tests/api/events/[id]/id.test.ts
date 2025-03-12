import { GET, PUT, DELETE } from "@/app/api/events/[id]/route";
import { getUserID } from "@/lib/helper";
import Event from "@/lib/models/Event";
import { beforeEach, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
}));

jest.mock("@/lib/database/dbConnect", () => jest.fn());
jest.mock("@/lib/models/Event", () => ({
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
}));

describe("GET, PUT, DELETE /api/events/:id API Route: ", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/events/:id => get event by id", () => {
        it("should return 403 if user is not the creator or a member", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockResolvedValue({
                _id: "eventId",
                creator: { _id: "anotherUserId" },
                members: [],
            });

            const request = {} as NextRequest;
            const response = await GET(request, { params: { id: "eventId" } });

            expect(response.status).toBe(403);
            expect(await response.json()).toEqual({ success: false, error: "Zugriff verweigert" });
        });

        it("should return 200 and the event if the user is the creator", async () => {
            const userId = new mongoose.Types.ObjectId("abcdef0123567890abcdef01");
            (getUserID as jest.Mock).mockResolvedValue({ id: userId.toString() });
            (Event.findById as jest.Mock).mockResolvedValue({
                _id: "eventId",
                title: "Test Event",
                description: "Event Beschreibung",
                creator: { _id: userId },
                members: [],
            });

            const request = {} as NextRequest;
            const response = await GET(request, { params: { id: "eventId" } });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                success: true,
                data: {
                    _id: "eventId",
                    title: "Test Event",
                    description: "Event Beschreibung",
                    creator: { _id: userId.toString() },
                    members: [],
                },
            });
        });

        it("should return 404 if event is not found", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockResolvedValue(null);

            const request = {} as NextRequest;
            const response = await GET(request, { params: { id: "eventId" } });

            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ success: false, error: "Event nicht gefunden." });
        });

        it("should return 500 if an error occurs", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

            const request = {} as NextRequest;
            const response = await GET(request, { params: { id: "eventId" } });

            expect(response.status).toBe(500);
            expect(await response.json()).toEqual({ success: false, error: "Internal Server Error" });
        });
    });

    describe("PUT /api/events/:id => update event by id", () => {
        it("should return 403 if user is not the event creator", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockResolvedValue({ creator: "anotherUserId" });

            const request = {} as NextRequest;
            const response = await PUT(request, { params: { id: "eventId" } });

            expect(response.status).toBe(403);
            expect(await response.json()).toEqual({ success: false, error: "Nicht berechtigt, dieses Event zu bearbeiten." });
        });

        it("should update the event if the user is the creator", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockResolvedValue({ creator: "userId" });
            (Event.findByIdAndUpdate as jest.Mock).mockResolvedValue({ title: "Updated Event" });

            const request = {
                json: jest.fn().mockResolvedValue({ title: "Updated Event" }),
            } as unknown as NextRequest;
            const response = await PUT(request, { params: { id: "eventId" } });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true, data: { title: "Updated Event" } });
        });

        it("should return 404 if event is not found", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockResolvedValue(null);

            const request = {} as NextRequest;
            const response = await PUT(request, { params: { id: "eventId" } });

            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ success: false, error: "Event nicht gefunden." });
        });

        it("should return 500 if an error occurs", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

            const request = {} as NextRequest;
            const response = await PUT(request, { params: { id: "eventId" } });

            expect(response.status).toBe(500);
            expect(await response.json()).toEqual({ success: false, error: "Internal Server Error" });
        });
    });

    describe("DELETE /api/events/:id => delete event by id", () => {
        it("should return 403 if user is not the event creator", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockResolvedValue({ creator: "anotherUserId" });

            const request = {} as NextRequest;
            const response = await DELETE(request, { params: { id: "eventId" } });

            expect(response.status).toBe(403);
            expect(await response.json()).toEqual({ success: false, error: "Nicht berechtigt, dieses Event zu löschen" });
        });

        it("should delete the event if user is the creator", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockResolvedValue({ creator: "userId" });
            (Event.findByIdAndDelete as jest.Mock).mockResolvedValue({});

            const request = {} as NextRequest;
            const response = await DELETE(request, { params: { id: "eventId" } });

            expect(Event.findByIdAndDelete).toHaveBeenCalledWith("eventId");
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true, message: "Event wurde gelöscht" });
        });

        it("should return 404 if event is not found", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockResolvedValue(null);

            const request = {} as NextRequest;
            const response = await DELETE(request, { params: { id: "eventId" } });

            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ success: false, error: "Event nicht gefunden." });
        });

        it("should return 500 if an error occurs", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (Event.findById as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

            const request = {} as NextRequest;
            const response = await DELETE(request, { params: { id: "eventId" } });

            expect(response.status).toBe(500);
            expect(await response.json()).toEqual({ success: false, error: "Internal Server Error" });
        });
    });
});
