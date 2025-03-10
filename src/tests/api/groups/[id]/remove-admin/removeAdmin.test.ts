import { getUserID, getGroup } from "@/lib/helper";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { PATCH } from "@/app/api/groups/[id]/remove-admin/route";
import { NextRequest } from "next/server";


jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn(),
    getGroup: jest.fn(),
}));

describe("PATCH /api/groups/:id/remove-admin => remove admin privileges", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    it("should return 401 if user is not authenticated", async () => {
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

    it("should return 403 if user is not the creator of the group", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (getGroup as jest.Mock).mockResolvedValue({ creator: "anotherUserId", admins: ["anotherUserId", "user1"], save: jest.fn() });

        const request = {} as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });
        expect(response.status).toBe(403);
        expect(await response.json()).toEqual({ success: false, error: "Nur der Creator kann neue Admins hinzufügen" });
    });

    it("should return 400 if the given user is not an admin", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (getGroup as jest.Mock).mockResolvedValue({ creator: "userId", admins: ["userId", "adminUserID"], save: jest.fn() });

        const request = { json: jest.fn().mockResolvedValue({ adminId: "anotherUserID" }) } as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ success: false, error: "Der Benutzer ist kein Admin" });
    });



    it("should remove an admin and return success", async () => {
        const mockSave = jest.fn();
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (getGroup as jest.Mock).mockResolvedValue({ creator: "userId", admins: ["userId", "admin1ID", "admin2ID"], save: mockSave });

        const request = { json: jest.fn().mockResolvedValue({ adminId: "admin1ID" }) } as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });

        expect(mockSave).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true, message: "Adminrechte entzogen" });
    });

    it("should return 500 if an error occurs", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "testUserID"});
        (getGroup as jest.Mock).mockRejectedValue(new Error("Server Fehler"));

        const request = { json: jest.fn().mockResolvedValue({ adminId: "adminId"})} as unknown as NextRequest;
        const response = await PATCH(request, { params: { id: "groupId" } });
        console.log("response: ", response);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ success: false, error: "Server Fehler" });
    })

})