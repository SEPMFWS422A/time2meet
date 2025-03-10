import { beforeEach, describe, expect, it } from "@jest/globals";
import { getUserID, getGroup } from "@/lib/helper";
import Group from "@/lib/models/Group";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";


jest.mock("@/lib/database/dbConnect", () => jest.fn());
jest.mock("@/lib/models/Group", () => ({
    findById: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
    verify: jest.fn(),
}));

describe("helper functions: getUserID and getGroup", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getUserID", () => {
        it("should return 401 if no token is provided", async () => {
            const request = {
                cookies: {
                    get: jest.fn().mockReturnValue(undefined),
                },
            } as unknown as NextRequest;

            const response = await getUserID(request);
            expect(response).toEqual({ error: "Nicht authentifiziert", status: 401 });
        });

        it("should return 403 if token is invalid", async () => {
            (jwt.verify as jest.Mock).mockImplementation(() => {
                throw new Error("Invalid token");
            });

            const request = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: "invalid_token" }),
                },
            } as unknown as NextRequest;

            const response = await getUserID(request);
            expect(response).toEqual({ error: "Ungültiges Token", status: 403 });
        });

        it("should return user Id if token is valid", async () => {
            (jwt.verify as jest.Mock).mockReturnValue({ id: "user_id" });

            const request = {
                cookies: {
                    get: jest.fn().mockReturnValue({ value: "valid_token" }),
                },
            } as unknown as NextRequest;

            const response = await getUserID(request);
            expect(response).toEqual({ id: "user_id" });
            expect(jwt.verify).toHaveBeenCalledWith("valid_token", process.env.TOKEN_SECRET);
        });
    });


    describe("getGroup", () => {
        it("should return 404 if group is not found", async () => {
            (Group.findById as jest.Mock).mockReturnValue(null);

            const response = await getGroup("group_id");
            expect(response).toEqual({ error: "Gruppe nicht gefunden", status: 404 });
        });

        it("should return group if group is found", async () => {
            const mockGroup = { _id: "groupID", groupname: "Test Group", description: "Test Description" };
            (Group.findById as jest.Mock).mockResolvedValue(mockGroup);

            const response = await getGroup("groupID");
            expect(response).toEqual(mockGroup);
            expect(Group.findById).toHaveBeenCalledWith(mockGroup._id);
        });
    });
});