import { afterAll, beforeAll, describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import mongoose from "mongoose";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import Event from "@/lib/models/Event";
import { GET as getEvents, POST as createEvent } from "@/app/api/events/route";
import { NextRequest } from "next/server";

let primaryUser: any;
let secondaryUser: any;

describe("Integration Test: Events API", () => {
    beforeAll(async () => {
        await dbConnect();
        await User.deleteMany({ email: { $in: ["testuser@example.com", "memberuser@example.com"]}});
        await Event.deleteMany({ title: { $in: ["Test Event", "New Event"] } });

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
    });

    afterAll(async () => {
        await Event.deleteMany({ title: { $in: ["Test Event", "New Event"] } });
        await User.deleteMany({ email: { $in: ["testuser@example.com", "memberuser@example.com"]}});
        await mongoose.connection.close();
    });

    // Korrigiertes Mock für den Auth-Endpoint
    beforeEach(() => {
        // Mock für den Fetch-Aufruf zur Authentifizierungs-API
        global.fetch = jest.fn((url) => {
            if (url === "http://localhost:3000/api/userauth/decode") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: primaryUser._id.toString() })
                }) as any;
            }
            return Promise.reject(new Error(`Unexpected fetch call: ${url}`));
        });

        // Mock für die Cookie-Überprüfung - Stellt sicher, dass der "token" Cookie erkannt wird
        jest.spyOn(NextRequest.prototype, 'cookies', 'get').mockImplementation(() => ({
            get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
        } as any));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("GET /api/events", () => {
        it("returns an empty event list if no events exist", async () => {
            const mockRequest = {
                headers: {
                    get: (header: string) => (header === "cookie" ? "token=valid-jwt-token" : null),
                },
                cookies: {
                    get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
                }
            } as unknown as NextRequest;

            const response = await getEvents(mockRequest);
            expect(response.status).toBe(200);

            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(0);
        });

        it("returns a list of events when events exist", async () => {
            // Event erstellen
            const testEvent = await Event.create({
                title: "Test Event",
                start: new Date("2025-01-20T10:00:00"),
                end: new Date("2025-01-20T12:00:00"),
                description: "Test Event Description",
                location: "Test Location",
                allday: false,
                creator: primaryUser._id,
                members: [primaryUser._id, secondaryUser._id],
            });

            const mockRequest = {
                headers: {
                    get: (header: string) => (header === "cookie" ? "token=valid-jwt-token" : null),
                },
                cookies: {
                    get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
                }
            } as unknown as NextRequest;

            const response = await getEvents(mockRequest);
            expect(response.status).toBe(200);

            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0]._id.toString()).toBe(testEvent._id.toString());
            expect(result.data[0].title).toBe(testEvent.title);
        });
    });

    describe("POST /api/events", () => {
        it("creates a new event successfully", async () => {
            const mockRequest = {
                json: async () => ({
                    title: "New Event",
                    start: "2025-02-15T15:00:00",
                    end: "2025-02-15T17:00:00",
                    description: "New Event Description",
                    location: "New Location",
                    members: [primaryUser._id, secondaryUser._id],
                    allday: false,
                }),
                headers: {
                    get: (header: string) => (header === "cookie" ? "token=valid-jwt-token" : null),
                },
                cookies: {
                    get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
                }
            } as unknown as NextRequest;

            const response = await createEvent(mockRequest);
            expect(response.status).toBe(201);

            const result = await response.json();
            expect(result.success).toBe(true);
            expect(result.data).toHaveProperty("_id");
            expect(result.data.title).toBe("New Event");

            const savedEvent = await Event.findOne({ title: "New Event" });
            expect(savedEvent).not.toBeNull();
        });

        it("returns an error if title or start date is missing", async () => {
            const mockRequest = {
                json: async () => ({
                    description: "Event ohne Titel",
                    location: "Location",
                }),
                headers: {
                    get: (header: string) => (header === "cookie" ? "token=valid-jwt-token" : null),
                },
                cookies: {
                    get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
                }
            } as unknown as NextRequest;

            const response = await createEvent(mockRequest);
            expect(response.status).toBe(400);

            const result = await response.json();
            expect(result.success).toBe(false);
            expect(result.error).toBe("Title und Start-Datum sind erforderlich.");
        });
    });
});