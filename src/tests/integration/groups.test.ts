import { GET, POST } from "@/app/api/groups/route";
import dbConnect from "@/lib/database/dbConnect";
import { getUserID } from "@/lib/helper";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { NextRequest } from "next/server";


jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
}));

describe("Integration Test: groups API (GET, POST)", () => {
    let testUser: any;
    let anotherUser: any;
    let testGroup: any;
    let favoriteGroup: any;

    beforeAll(async () => {
        await dbConnect();
        await User.deleteMany({ email: { $in: ["test@test.com"]}});
        await Group.deleteMany({ groupname: { $in: [ "testGroup" ]}});

        testUser = await User.create({
            email: "test@test.com",
            benutzername: "testUser",
            password: "password",
            favouriteGroups: [],
        });

        testGroup = await Group.create({
            groupname: "testGroup",
            beschreibung: "testBeschreibung",
            creator: testUser._id,
            admins: [testUser._id],
            members: [testUser._id],
        });

        (getUserID as jest.Mock).mockResolvedValue({ id: testUser._id.toString() });
    });

    afterAll(async () => {
        await User.deleteMany({ email: { $in: ["test@test.com"]}});
        await Group.deleteMany({ groupname: { $in: ["testGroup"]}});
        await mongoose.connection.close();
    });

    describe("GET /api/groups", () => {
        it("should return 200 and a list of groups for an authenticated user", async () => {
            const request = {} as unknown as NextRequest;

            const response = await GET(request);

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data.length).toBe(1);
            expect(data.data[0]._id).toBe(testGroup._id.toString());
            expect(data.data[0].groupname).toBe(testGroup.groupname);
            expect(data.data[0].beschreibung).toBe(testGroup.beschreibung);
            expect(data.data[0].isFavourite).toBe(false);
        });
    });

    describe("POST /api/groups", () => {
        it("should create a new group successfully", async () => {
            const request = {
                json: async () => ({
                    groupname: "New Group",
                    beschreibung: "New Group description",
                }),
            } as unknown as NextRequest;

            const response = await POST(request);
            expect(response.status).toBe(201);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data).toHaveProperty("_id");
            expect(data.data.groupname).toBe("New Group");
            expect(data.data.beschreibung).toBe("New Group description");
            expect(data.data.creator).toBe(testUser._id.toString());
        });

        it("should return 400 if groupname is missing", async () => {
            const request = {
                json: async () => ({
                    beschreibung: "New Group without groupname",
                }),
            } as unknown as NextRequest;

            const response = await POST(request);
            expect(response.status).toBe(400);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe("Groupname ist erforderlich.");
        });
    });
})

