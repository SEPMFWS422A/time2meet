import { afterAll, beforeAll, describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import mongoose from "mongoose";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import Event from "@/lib/models/Event";
import { GET as getEventById, PUT as updateEvent, DELETE as deleteEvent } from "@/app/api/events/[id]/route";
import { NextRequest } from "next/server";

let primaryUser: any;
let secondaryUser: any;
let unauthorizedUser: any;
let testEvent: any;

describe("Integration Test: Events API (Get, Update, Delete)", () => {
    beforeAll(async () => {
        await dbConnect();
        await User.deleteMany({});
        await Event.deleteMany({});

        primaryUser = await User.create({
            email: "testuser@example.com",
            vorname: "Test",
            name: "User",
            benutzername: "testuser",
            password: "password",
        });

        secondaryUser = await User.create({
            email: "memberuser@example.com",
            vorname: "Member",
            name: "User",
            benutzername: "memberuser",
            password: "password",
        });

        unauthorizedUser = await User.create({
            email: "unauthorized@example.com",
            vorname: "Unauthorized",
            name: "User",
            benutzername: "unauthorizeduser",
            password: "password",
        });

        testEvent = await Event.create({
            title: "Test Event",
            start: new Date("2025-01-20T10:00:00"),
            end: new Date("2025-01-20T12:00:00"),
            description: "Test Event Description",
            location: "Test Location",
            allday: false,
            creator: primaryUser._id,
            members: [primaryUser._id, secondaryUser._id],
        });
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Event.deleteMany({});
        await mongoose.connection.close();
    });

    // 🔹 Mock die Authentifizierung für alle Tests (GET, PUT, DELETE)
    beforeEach(() => {
        global.fetch = jest.fn().mockImplementation(async (url) => {
            if (url === "http://localhost:3000/api/userauth/decode") {
                return {
                    ok: true,
                    json: async () => ({ id: primaryUser._id.toString() }),
                } as Response;
            }
            throw new Error("Unbekannte Anfrage");
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("GET /api/events/[id]", () => {
        it("returns event data if event exists and user has access", async () => {
            const mockRequest = {
                headers: {
                    get: () => "cookie=valid",
                },
            } as unknown as NextRequest;

            const params = { id: testEvent._id.toString() };
            const response = await getEventById(mockRequest, { params });

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data._id).toBe(testEvent._id.toString());
            expect(result.data.title).toBe("Test Event");
        });

        it("returns 403 if user does not have access to the event", async () => {
            // Mocking einen nicht berechtigten Benutzer
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: unauthorizedUser._id.toString() }),
            }) as any;

            const mockRequest = {
                headers: {
                    get: () => "cookie=valid",
                },
            } as unknown as NextRequest;

            const params = { id: testEvent._id.toString() };
            const response = await getEventById(mockRequest, { params });

            expect(response.status).toBe(403);
            const result = await response.json();
            expect(result.success).toBe(false);
            expect(result.error).toBe("Zugriff verweigert");
        });

        it("returns 404 if event does not exist", async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const mockRequest = {
                headers: {
                    get: () => "cookie=valid",
                },
            } as unknown as NextRequest;

            const params = { id: fakeId };
            const response = await getEventById(mockRequest, { params });

            expect(response.status).toBe(404);
            const result = await response.json();
            expect(result.success).toBe(false);
            expect(result.error).toBe("Event nicht gefunden.");
        });
    });

    describe("PUT /api/events/[id]", () => {
        it("updates event data if user is creator", async () => {
            const updatePayload = {
                title: "Updated Event",
                description: "Updated Description",
                location: "Updated Location",
            };

            const mockRequest = {
                json: async () => updatePayload,
                headers: {
                    get: () => "cookie=valid",
                },
            } as unknown as NextRequest;

            const params = { id: testEvent._id.toString() };
            const response = await updateEvent(mockRequest, { params });

            expect(response.status).toBe(200);
            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data.title).toBe("Updated Event");

            const updatedEvent = await Event.findById(testEvent._id);
            expect(updatedEvent.title).toBe("Updated Event");
        });

        it("returns 403 if user is not the creator", async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: unauthorizedUser._id.toString() }),
            }) as any;

            const updatePayload = { title: "Hacked Event" };

            const mockRequest = {
                json: async () => updatePayload,
                headers: {
                    get: () => "cookie=valid",
                },
            } as unknown as NextRequest;

            const params = { id: testEvent._id.toString() };
            const response = await updateEvent(mockRequest, { params });

            expect(response.status).toBe(403);
        });

        it("returns 404 if event does not exist", async () => {
            const updatePayload = { title: "Nonexistent Event" };
            const fakeId = new mongoose.Types.ObjectId().toString();

            const mockRequest = {
                json: async () => updatePayload,
                headers: {
                    get: () => "cookie=valid",
                },
            } as unknown as NextRequest;

            const params = { id: fakeId };
            const response = await updateEvent(mockRequest, { params });

            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /api/events/[id]", () => {
        it("deletes event if user is creator", async () => {
            const eventToDelete = await Event.create({
                title: "To Be Deleted",
                start: new Date(),
                end: new Date(),
                description: "Delete this event",
                creator: primaryUser._id,
                members: [primaryUser._id],
            });

            const mockRequest = {
                headers: {
                    get: () => "cookie=valid",
                },
            } as unknown as NextRequest;

            const params = { id: eventToDelete._id.toString() };
            const response = await deleteEvent(mockRequest, { params });

            expect(response.status).toBe(200);

            const deletedEvent = await Event.findById(eventToDelete._id);
            expect(deletedEvent).toBeNull();
        });

        it("returns 403 if user is not the creator", async () => {
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: unauthorizedUser._id.toString() }),
            }) as any;

            const params = { id: testEvent._id.toString() };
            const mockRequest = {
                headers: {
                    get: () => "cookie=valid",
                },
            } as unknown as NextRequest;

            const response = await deleteEvent(mockRequest, { params });
            expect(response.status).toBe(403);
        });
    });
});
