import { DELETE, GET } from "@/app/api/groups/[id]/route";
import { getGroup, getUserID } from "@/lib/helper";
import Group from "@/lib/models/Group";
import { beforeEach, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
    getGroup: jest.fn(),
}));

jest.mock("@/lib/database/dbConnect", () => jest.fn());
jest.mock("@/lib/models/Group", () => ({
    findByIdAndDelete: jest.fn(),
}));


describe("GET and DELETE by ID API Route: ", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    describe("GET /api/groups/:id => get group by id", () => {
        it("should eturn 403 if user is not a member of the group", async () => {
            const userId = new mongoose.Types.ObjectId().toString();
            (getUserID as jest.Mock).mockResolvedValue({ id: userId });
            (getGroup as jest.Mock).mockResolvedValue({
                _id: "groupId",
                members: [new mongoose.Types.ObjectId()],
            });

            const request = {} as NextRequest;
            const response = await GET(request, { params: Promise.resolve({ id: "1234567890abcdef01234567" }) });

            expect(response.status).toBe(403);
            expect(await response.json()).toEqual({ success: false, error: "Zugriff verweigert" });
        });


        it("should return 200 and the group if the user is a member", async () => {
            const userId = new mongoose.Types.ObjectId();
            (getUserID as jest.Mock).mockResolvedValue({ id: userId.toString() });
            (getGroup as jest.Mock).mockResolvedValue({
                 _id: "groupId", 
                 members: [userId], 
                 name: "Test Group", 
                 description: "Test Description" ,
            });
            const request = {} as NextRequest;
            const response = await GET(request, { params: Promise.resolve({ id: "groupId" }) });

            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({
                success: true,
                data: { _id: "groupId", members: [userId.toString()], name: "Test Group", description: "Test Description" },
            });
        });

        it("should return 404 if group is not found", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (getGroup as jest.Mock).mockResolvedValue({ error: "Gruppe nicht gefunden", status: 404 });

            const request = {} as NextRequest;
            const response = await GET(request, { params: Promise.resolve({ id: "groupId" }) });
            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ success: false, error: "Gruppe nicht gefunden" });
        });

        it("should return 500 if an error occurs", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (getGroup as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

            const request = {} as NextRequest;
            const response = await GET(request, { params: Promise.resolve({ id: "groupId" }) });
            expect(response.status).toBe(500);
            expect(await response.json()).toEqual({ success: false, error: "Internal Server Error" });
        });
    });


    describe("DELETE /api/groups/:id => delete group by id", () => {

        it("should return 403 if user is not the group creator", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (getGroup as jest.Mock).mockResolvedValue({
                 _id: "groupId",
                 creator: "anotherUserId" ,
            });

            const request = {} as NextRequest;
            const response = await DELETE(request, { params: Promise.resolve({ id: "groupId" }) });

            expect(response.status).toBe(403);
            expect(await response.json()).toEqual({ success: false, error: "Nicht berechtigt, diese Gruppe zu löschen" });
        });

        it("should delete the group if user is the creator", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (getGroup as jest.Mock).mockResolvedValue({
                _id: "groupId",
                creator: "userId",
            });

            (Group.findByIdAndDelete as jest.Mock).mockResolvedValue({});

            const request = {} as NextRequest;
            const response = await DELETE(request, { params: Promise.resolve({ id: "groupId" }) });

            expect(Group.findByIdAndDelete).toHaveBeenCalledWith("groupId");
            expect(response.status).toBe(200);
            expect(await response.json()).toEqual({ success: true, message: "Gruppe wurde gelöscht" });
        });

        it("should return 404 if group is not found", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (getGroup as jest.Mock).mockResolvedValue({ error: "Gruppe nicht gefunden", status: 404 });

            const request = {} as NextRequest;
            const response = await DELETE(request, { params: Promise.resolve({ id: "groupId" }) });
            expect(response.status).toBe(404);
            expect(await response.json()).toEqual({ success: false, error: "Gruppe nicht gefunden" });
        });

        it("should return 500 if an error occurs", async () => {
            (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
            (getGroup as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

            const request = {} as NextRequest;
            const response = await DELETE(request, { params: Promise.resolve({ id: "groupId" }) });
            expect(response.status).toBe(500);
            expect(await response.json()).toEqual({ success: false, error: "Internal Server Error" });
        });
    });
});