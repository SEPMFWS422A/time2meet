import { afterAll, beforeAll, describe, expect, it, beforeEach, afterEach, jest } from "@jest/globals";
import mongoose from "mongoose";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import Event from "@/lib/models/Event";
import Group from "@/lib/models/Group";
import { GET as getEventsByUserId } from "@/app/api/events/[id]/route";
import { NextRequest } from "next/server";

let testUser: any;
let otherUser: any;
let testGroup: any;
let userEvents: any[];
let otherEvents: any[];

// Mock für getCurrentUser-Funktion
jest.mock("@/app/api/events/[id]/route", () => {
    const originalModule = jest.requireActual("@/app/api/events/[id]/route");

    // Original-Exports beibehalten mit explizitem Typing
    return {
        ...(originalModule as Record<string, unknown>),
        // getCurrentUser überschreiben, um den angegebenen Benutzer zurückzugeben
        getCurrentUser: jest.fn().mockImplementation(() => {
            return Promise.resolve(testUser);
        })
    };
});

describe("Integration Test: Events by User ID API", () => {
    beforeAll(async () => {
        await dbConnect();

        // Testbenutzer erstellen
        testUser = await User.create({
            email: "testuser@example.com",
            vorname: "Test",
            name: "User",
            benutzername: "testuser",
            password: "password",
        });

        otherUser = await User.create({
            email: "otheruser@example.com",
            vorname: "Other",
            name: "User",
            benutzername: "otheruser",
            password: "password",
        });

        // Testgruppe erstellen
        testGroup = await Group.create({
            groupname: "Test Group",
            beschreibung: "Test Group Description",
            creator: testUser._id,
            members: [testUser._id, otherUser._id]
        });

        // Events für den Testbenutzer erstellen
        userEvents = await Promise.all([
            Event.create({
                title: "User Event 1",
                start: new Date("2025-01-20T10:00:00"),
                end: new Date("2025-01-20T12:00:00"),
                description: "User Event 1 Description",
                location: "User Location 1",
                allday: false,
                creator: testUser._id,
                members: [testUser._id],
            }),
            Event.create({
                title: "User Event 2",
                start: new Date("2025-01-21T14:00:00"),
                end: new Date("2025-01-21T16:00:00"),
                description: "User Event 2 Description",
                location: "User Location 2",
                allday: false,
                creator: testUser._id,
                members: [testUser._id, otherUser._id],
            }),
            Event.create({
                title: "Group Event",
                start: new Date("2025-01-22T09:00:00"),
                end: new Date("2025-01-22T11:00:00"),
                description: "Group Event Description",
                location: "Group Location",
                allday: false,
                creator: testUser._id,
                members: [testUser._id, otherUser._id],
                groups: [testGroup._id]
            })
        ]);

        // Events für den anderen Benutzer erstellen
        otherEvents = await Promise.all([
            Event.create({
                title: "Other User Event",
                start: new Date("2025-01-23T13:00:00"),
                end: new Date("2025-01-23T15:00:00"),
                description: "Other User Event Description",
                location: "Other User Location",
                allday: false,
                creator: otherUser._id,
                members: [otherUser._id],
            })
        ]);
    });

    afterAll(async () => {
        await User.deleteMany({});
        await Event.deleteMany({});
        await Group.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(() => {
        // Direktes Mocken der fetch-Funktion
        // @ts-ignore
        global.fetch = jest.fn().mockImplementation((url) => {
            if (url === "http://localhost:3000/api/userauth/decode") {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ id: testUser._id.toString() }),
                }) as unknown as Response;
            }
            return Promise.reject(new Error(`Unerwarteter Aufruf: ${url}`));
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/events/[id]", () => {
        it("returns all events for the user if user is requesting their own events", async () => {
            const mockRequest = {
                headers: {
                    get: (header: string) => (header === "cookie" ? "token=valid-jwt-token" : null),
                },
                cookies: {
                    get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
                },
                nextUrl: new URL(`http://localhost:3000/api/events/${testUser._id}`),
            } as unknown as NextRequest;

            const params = { id: testUser._id.toString() };
            const response = await getEventsByUserId(mockRequest, { params });
            const result = await response.json();

            console.log("GET Test (own events) - Status:", response.status);
            console.log("GET Test (own events) - Data:", JSON.stringify(result, null, 2));

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);
            expect(result.data.length).toBe(userEvents.length);

            // Überprüfen, ob alle Events des Benutzers enthalten sind
            const eventIds = result.data.map((event: any) => event._id);
            userEvents.forEach(event => {
                expect(eventIds).toContain(event._id.toString());
            });
        });

        it("returns only shared events if user is requesting someone else's events", async () => {
            const mockRequest = {
                headers: {
                    get: (header: string) => (header === "cookie" ? "token=valid-jwt-token" : null),
                },
                cookies: {
                    get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
                },
                nextUrl: new URL(`http://localhost:3000/api/events/${otherUser._id}`),
            } as unknown as NextRequest;

            const params = { id: otherUser._id.toString() };
            const response = await getEventsByUserId(mockRequest, { params });
            const result = await response.json();

            console.log("GET Test (other user events) - Status:", response.status);
            console.log("GET Test (other user events) - Data:", JSON.stringify(result, null, 2));

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);

            // Überprüfen, ob nur gemeinsame Events enthalten sind
            const eventIds = result.data.map((event: any) => event._id);

            // Diese Events sollten enthalten sein (gemeinsame Events)
            const sharedEvents = userEvents.filter(event =>
                event.members.some((member: any) => member.toString() === otherUser._id.toString())
            );

            sharedEvents.forEach(event => {
                expect(eventIds).toContain(event._id.toString());
            });

            // Überprüfen, ob nicht-gemeinsame Events nicht enthalten sind
            const nonSharedEvents = userEvents.filter(event =>
                !event.members.some((member: any) => member.toString() === otherUser._id.toString())
            );

            nonSharedEvents.forEach(event => {
                expect(eventIds).not.toContain(event._id.toString());
            });
        });

        it("returns 404 if user does not exist", async () => {
            const fakeId = new mongoose.Types.ObjectId().toString();
            const mockRequest = {
                headers: {
                    get: (header: string) => (header === "cookie" ? "token=valid-jwt-token" : null),
                },
                cookies: {
                    get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
                },
                nextUrl: new URL(`http://localhost:3000/api/events/${fakeId}`),
            } as unknown as NextRequest;

            const params = { id: fakeId };
            const response = await getEventsByUserId(mockRequest, { params });
            const result = await response.json();

            console.log("GET Test (user not found) - Status:", response.status);
            console.log("GET Test (user not found) - Data:", JSON.stringify(result, null, 2));

            expect(response.status).toBe(404);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Benutzer nicht gefunden.");
        });

        it("returns events for a specific time range when query parameters are provided", async () => {
            const mockRequest = {
                headers: {
                    get: (header: string) => (header === "cookie" ? "token=valid-jwt-token" : null),
                },
                cookies: {
                    get: (name: string) => name === "token" ? { value: "valid-jwt-token" } : null
                },
                nextUrl: new URL(`http://localhost:3000/api/events/${testUser._id}?start=2025-01-20&end=2025-01-21`),
            } as unknown as NextRequest;

            const params = { id: testUser._id.toString() };
            const response = await getEventsByUserId(mockRequest, { params });
            const result = await response.json();

            console.log("GET Test (time range) - Status:", response.status);
            console.log("GET Test (time range) - Data:", JSON.stringify(result, null, 2));

            expect(response.status).toBe(200);
            expect(result.success).toBe(true);
            expect(Array.isArray(result.data)).toBe(true);

            // Überprüfen, ob nur Events im angegebenen Zeitraum enthalten sind
            result.data.forEach((event: any) => {
                const eventStart = new Date(event.start);
                expect(eventStart >= new Date("2025-01-20") && eventStart <= new Date("2025-01-21T23:59:59")).toBe(true);
            });
        });
    });
});