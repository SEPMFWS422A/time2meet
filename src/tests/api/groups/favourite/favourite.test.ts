import { POST } from "@/app/api/groups/favourite/route";
import { getUserID } from "@/lib/helper";
import User from "@/lib/models/User";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";


jest.mock("@/lib/helper", () => ({
    getUserID: jest.fn()
}));

jest.mock("@/lib/models/User", () => ({
    findById: jest.fn()
}));

jest.mock("@/lib/database/dbConnect", () => jest.fn());

describe("POST /api/groups/favourite", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 401 if user is not authenticated", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ error: "Nicht authentifiziert", status: 401 });

        const request = {} as NextRequest;
        const response = await POST(request);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({ success: false, error: "Nicht authentifiziert" });
    });

    it("should return 400 if groupId is missing", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });

        const request = { json: jest.fn().mockResolvedValue({}), } as unknown as NextRequest;
        const response = await POST(request);
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ success: false, error: "Gruppen ID fehlt" });
    });


    it("should return 404 if user is not found", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (User.findById as jest.Mock).mockResolvedValue(null);

        const request = { json: jest.fn().mockResolvedValue({ groupId: "groupId" }) } as unknown as NextRequest;
        const response = await POST(request);
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ success: false, error: "Benutzer nicht gefunden" });
    });

    it("should add groupId to favouriteGroups if not already in there", async () => {
        const mockSave = jest.fn();
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (User.findById as jest.Mock).mockResolvedValue({ favouriteGroups: [], save: mockSave });

        const request = { json: jest.fn().mockResolvedValue({ groupId: "groupId" }) } as unknown as NextRequest;
        const response = await POST(request);

        expect(mockSave).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true, isFavourite: true });
    });

    it("should remove groupId from favouriteGroups if already in favouries", async () => {
        const mockSave = jest.fn();
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (User.findById as jest.Mock).mockResolvedValue({ favouriteGroups: ["groupId"], save: mockSave });

        const request = { json: jest.fn().mockResolvedValue({ groupId: "groupId" }) } as unknown as NextRequest;
        const response = await POST(request);

        expect(mockSave).toHaveBeenCalled();
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ success: true, isFavourite: false });
    });

    it("should return 500 if an error occurs", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "userId" });
        (User.findById as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

        const request = { json: jest.fn().mockResolvedValue({ groupId: "groupId" }) } as unknown as NextRequest;
        const response = await POST(request);

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ success: false, error: "Internal Server Error" });
    });


})
