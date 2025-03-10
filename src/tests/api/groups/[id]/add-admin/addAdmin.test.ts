import { PATCH } from "@/app/api/groups/[id]/add-admin/route";
import { NextRequest, NextResponse } from "next/server";
import { getUserID, getGroup } from "@/lib/helper";
import { beforeEach, describe, expect, it } from "@jest/globals";

jest.mock("@/lib/helper", () => ({
  getUserID: jest.fn(),
    getGroup: jest.fn(),
}));

describe("PATCH /api/groups/[id]/add-admin", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ error: "Not authenticated", status: 401 });
        const request = {} as NextRequest;
        const response = await PATCH(request, { params: { id: "testGroupID" } });
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ success: false, error: "Not authenticated" });
    });

    it("should return 404 if group is not found", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "testUserID" });
        (getGroup as jest.Mock).mockResolvedValue({ error: "Gruppe nicht gefunden", status: 404 });
        const request = {} as NextRequest;
        const response = await PATCH(request, { params: { id: "testGroupID" } });
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ success: false, error: "Gruppe nicht gefunden" });
    });

    it("should return 403 if user is not the group creator", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "testUserID" });
        (getGroup as jest.Mock).mockResolvedValue({ creator: "anotherUserID", admins: [], members: [], save: jest.fn() });
        const request = {} as NextRequest;
        const response = await PATCH(request, { params: { id: "testGroupID" } });
        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ success: false, error: "Nur der Creator kann neue Admins hinzufügen" });
    });

    it("should return 403 if the user is already an admin of the group", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "testUserID" });
        (getGroup as jest.Mock).mockResolvedValue({ creator: "testUserID", admins: ["testUserID", "adminUserID"], members: ["testUserID", "adminUserID"], save: jest.fn() });

        const request = { json: jest.fn().mockResolvedValue({ newAdmin: "adminUserID" }) } as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "testGroupID" } });
        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ success: false, error: "Diese user ist schon admin diese Gruppe." });
    });

    it("should add a new admin and return success", async () => {
        const mockSave = jest.fn();
        (getUserID as jest.Mock).mockResolvedValue({ id: "testUserID" });
        (getGroup as jest.Mock).mockResolvedValue({ creator: "testUserID", admins: [], members: [], save: mockSave });
        
        const request = { json: jest.fn().mockResolvedValue({ newAdmin: "adminUserID" }) } as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "testGroupID" } });
        expect(mockSave).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true, message: "Admin hinzugefügt" });
    });

    it("should return 500 if an error occurs", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "testUserID" });
        (getGroup as jest.Mock).mockRejectedValue(new Error("Datenbankfehler"));

        const request = { json: jest.fn().mockResolvedValue({ newAdmin: "adminUserID" }),} as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "testGroupID" } });
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ success: false, error: "Datenbankfehler" });
    });
});