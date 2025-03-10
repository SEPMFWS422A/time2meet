import { beforeEach, describe, expect, it } from "@jest/globals";
import { getUserID, getGroup } from "@/lib/helper";
import { PATCH } from "@/app/api/groups/[id]/update/route";
import { NextRequest } from "next/server";

jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
    getGroup: jest.fn(),
}));

describe("PATCH /api/groups/:id/update - update group data", () =>{
    beforeEach(() => {
        jest.clearAllMocks();
    });


    it("should return 401 if uer is not authenticated", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ error: "Nicht authentifiziert", status: 401 });
        const request = {} as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });

        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ success: false, error: "Nicht authentifiziert" });
    });


    it("should return 404 if group is not found", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (getGroup as jest.Mock).mockResolvedValue({ error: "Gruppe nicht gefunden", status: 404 });

        const request = {} as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ success: false, error: "Gruppe nicht gefunden" });
    });

    it("should return 403 if user is not an admin of the group", async () =>{
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (getGroup as jest.Mock).mockResolvedValue({ admins: ["anotherUserId", "user1"], save: jest.fn() });

        const request = {} as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });
        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ success: false, error: "Nicht berechtigt, Gruppendaten zu aktualisieren" });
    });

    it("should update the group name and description", async () => {
        const mockSave = jest.fn();
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (getGroup as jest.Mock).mockResolvedValue({ admins: ["userId"], groupname: "old Name", beschreibung: "Ole Description", save: mockSave });

        const request = { json: jest.fn().mockResolvedValue({ groupname: "New Name", beschreibung: "New Description" }) } as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });

        expect(mockSave).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true, data: { groupname: "New Name", beschreibung: "New Description", admins: ["userId"] } });
    });

    it("should update only the group name if description is not provided", async () => {
        const mockSave = jest.fn();
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (getGroup as jest.Mock).mockResolvedValue({ admins: ["userId"], groupname: "Old Name", beschreibung: "Old Description", save: mockSave });

        const request = { json: jest.fn().mockResolvedValue({ groupname: "New Name" }) } as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });

        expect(mockSave).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true, data: { groupname: "New Name", beschreibung: "Old Description", admins: ["userId"] } });
    });

    it("should update only the group description if groupname is not provided", async () => {
        const mockSave = jest.fn();
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (getGroup as jest.Mock).mockResolvedValue({ admins: ["userId"], groupname: "Old Name", beschreibung: "Old Description", save: mockSave });

        const request = { json: jest.fn().mockResolvedValue({ beschreibung: "New Description" }) } as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });
        expect(mockSave).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true, data: { groupname: "Old Name", beschreibung: "New Description", admins: ["userId"] } });
    });

    it("should return 500 if an error occurs", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "testUserID"});
        (getGroup as jest.Mock).mockRejectedValue(new Error("Test Server Error"));

        const request = { json: jest.fn().mockRejectedValue({ groupname: "New Name" }), } as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ success: false, error: "Test Server Error" });
    });
});