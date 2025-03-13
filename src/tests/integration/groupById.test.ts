import { DELETE, GET } from "@/app/api/groups/[id]/route";
import dbConnect from "@/lib/database/dbConnect";
import { getGroup, getUserID } from "@/lib/helper";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { NextRequest } from "next/server";



jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
    getGroup: jest.fn(),
}));

describe("Integration Test: GET & DELETE /api/groups/:id", () => {
    let testUser: any;
    let anotherUser: any;
    let testGroup: any;

    beforeAll(async () => {
        await dbConnect();
        await User.deleteMany({ email: { $in: ["testUser@test.com", "anotherUser@test.com"]}});
        await Group.deleteMany({ groupname: { $in: [ "testGroup" ]}});

        testUser = await User.create({
            email: "testUser@test.com",
            benutzername: "testUser",
            password: "password",
            favouriteGroups: [],
        });

        anotherUser = await User.create({
            email: "anotherUser@test.com",
            benutzername: "anotherUserUser",
            password: "anotherPassword",
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
        await User.deleteMany({ email: { $in: ["testUser@test.com", "anotherUser@test.com"]}});
        await Group.deleteMany({ groupname: { $in: [ "testGroup" ]}});
        await mongoose.connection.close();
    });


    describe("GET /api/groups/:id", () => {
        it("should return group data is the user is a member or admin", async () => {
            (getGroup as jest.Mock).mockResolvedValue(testGroup);
            
            const request = {} as unknown as NextRequest;

            const response = await GET(request, {
                params: Promise.resolve({ id: testGroup._id.toString() }),
            });

            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.data._id).toBe(testGroup._id.toString());
            expect(data.data.groupname).toBe(testGroup.groupname);
        });


        it("should return 403 if the user is not a member or admin", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: anotherUser._id.toString() });
            (getGroup as jest.Mock).mockResolvedValue(testGroup);
            const request = {} as unknown as NextRequest;
            const response = await GET(request, {
                params: Promise.resolve({ id: testGroup._id.toString() }),
            });

            expect(response.status).toBe(403);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe("Zugriff verweigert");

            //rest Mock für nächsten Tets
            (getUserID as jest.Mock).mockResolvedValue({ id: testUser._id.toString() });
        });

        it("should return 404 if the group does not exist", async () => {
            (getGroup as jest.Mock).mockResolvedValue({ error: "Gruppe nicht gefunden", status: 404 });
            const request = {} as unknown as NextRequest;
            const response = await GET(request, {
                params: Promise.resolve({ id: new mongoose.Types.ObjectId().toString() }),
            });

            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe("Gruppe nicht gefunden");
        });
    });



    describe("DELETE /api/groups/:id", () => {
        it("should delete the group if the user is the creator", async () => {
            (getGroup as jest.Mock).mockResolvedValue(testGroup);
            const request = {} as unknown as NextRequest;
            const response = await DELETE(request, {
                params: Promise.resolve({ id: testGroup._id.toString() }),
            });
            
            expect(response.status).toBe(200);
            const data = await response.json();
            expect(data.success).toBe(true);
            expect(data.message).toBe("Gruppe wurde gelöscht");

            // check if group was deleted
            const deletedGroup = await Group.findById(testGroup._id);
            expect(deletedGroup).toBeNull();
        });

        it("should return 403 if the user is not the cretor", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: anotherUser._id.toString() });
            (getGroup as jest.Mock).mockResolvedValue(testGroup);
            const request = {} as unknown as NextRequest;
            const response = await DELETE(request, {
                params: Promise.resolve({ id: testGroup._id.toString() }),
            });

            expect(response.status).toBe(403);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe("Nicht berechtigt, diese Gruppe zu löschen");

            // reset Mock für nchsten Test
            (getUserID as jest.Mock).mockResolvedValue({ id: testUser._id.toString() });
        });


        it("should return 404 if the group does not exist", async () => {
            (getGroup as jest.Mock).mockResolvedValue({ error: "Gruppe nicht gefunden", status: 404 });
            const request = {} as unknown as NextRequest;
            const response = await DELETE(request, {
                params: Promise.resolve({ id: new mongoose.Types.ObjectId().toString() }),
            });

            expect(response.status).toBe(404);
            const data = await response.json();
            expect(data.success).toBe(false);
            expect(data.error).toBe("Gruppe nicht gefunden");
        })
    });
})