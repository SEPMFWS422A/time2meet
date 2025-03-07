import { GET, POST } from "@/app/api/groups/route";
import { mockDeep } from "jest-mock-extended";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import { getUserID } from "@/lib/helper";

const { expect, describe, it } = require('@jest/globals');

// ✅ NextResponse global mocken
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ json: () => Promise.resolve(data), status: options.status })),
  },
}));

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/Group");
jest.mock("@/lib/models/User");
jest.mock("@/lib/helper", () => ({
  getUserID: jest.fn(),
}));

describe("API Routes: Groups", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/groups", () => {
    it("should return a list of groups the user is in", async () => {
        (dbConnect as jest.Mock).mockResolvedValue(undefined);
        (getUserID as jest.Mock).mockResolvedValue({ id: "user123", error: null });
      
        // 🔥 Fix für User.findById().select()
        (User.findById as jest.Mock).mockReturnValueOnce({
          select: jest.fn().mockResolvedValue({
            favouriteGroups: ["group1", "group2"],
          }),
        });
      
        (Group.find as jest.Mock).mockReturnValueOnce({
            select: jest.fn().mockReturnThis(), // ✅ Damit `.select()` auf der Query weiterverwendbar bleibt
            lean: jest.fn().mockResolvedValue([
              { _id: "group1", groupname: "Group One", beschreibung: "Test 1", members: ["user123"] },
              { _id: "group2", groupname: "Group Two", beschreibung: "Test 2", members: ["user123"] },
            ]),
          });
          
          
      
        // ✅ Mock-Request erstellen
        const mockReq = mockDeep<NextRequest>();
      
        const response = await GET(mockReq);
        const jsonResponse = await response.json();
      
        expect(response.status).toBe(200);
        expect(jsonResponse.success).toBe(true);
        expect(jsonResponse.data).toHaveLength(2);
        expect(jsonResponse.data[0].isFavourite).toBe(true);
      });
      

    it("should return an error if user authentication fails", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ error: "Unauthorized", status: 401 });

      const mockReq = mockDeep<NextRequest>();

      const response = await GET(mockReq);
      const jsonResponse = await response.json();

      expect(response.status).toBe(401);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toBe("Unauthorized");
    });
  });

  describe("POST /api/groups", () => {
    it("should create a new group successfully", async () => {
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (getUserID as jest.Mock).mockResolvedValue({ id: "user123", error: null });

      const mockReq = mockDeep<NextRequest>();
      (mockReq.json as jest.Mock).mockResolvedValue({ groupname: "New Group", beschreibung: "A test group" });

      (Group.prototype.save as jest.Mock).mockResolvedValue({
        _id: "group123",
        groupname: "New Group",
        beschreibung: "A test group",
        creator: "user123",
        admins: ["user123"],
        members: ["user123"],
      });

      const response = await POST(mockReq);
      const jsonResponse = await response.json();

      expect(response.status).toBe(201);
      expect(jsonResponse.success).toBe(true);
      expect(jsonResponse.data.groupname).toBe("New Group");
    });

    it("should return an error if groupname is missing", async () => {
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (getUserID as jest.Mock).mockResolvedValue({ id: "user123", error: null });

      const mockReq = mockDeep<NextRequest>();
      (mockReq.json as jest.Mock).mockResolvedValue({ beschreibung: "Missing name" });

      const response = await POST(mockReq);
      const jsonResponse = await response.json();

      expect(response.status).toBe(400);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toBe("Groupname ist erforderlich.");
    });

    it("should return an error if the user is not authenticated", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ error: "Unauthorized", status: 401 });

      const mockReq = mockDeep<NextRequest>();

      const response = await POST(mockReq);
      const jsonResponse = await response.json();

      expect(response.status).toBe(401);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toBe("Unauthorized");
    });

    it("should return a 500 error on unexpected issues", async () => {
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (getUserID as jest.Mock).mockResolvedValue({ id: "user123", error: null });

      const mockReq = mockDeep<NextRequest>();
      (mockReq.json as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await POST(mockReq);
      const jsonResponse = await response.json();

      expect(response.status).toBe(500);
      expect(jsonResponse.success).toBe(false);
      expect(jsonResponse.error).toBe("Database error");
    });
  });
});
