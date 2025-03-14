import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import { GET as getFriendsByUser, PATCH as updateFriendFavorite } from "@/app/api/friends/[userId]/route";
import { POST as addFriendEndpoint } from "@/app/api/friends/add/route";
import { DELETE as removeFriendEndpoint } from "@/app/api/friends/remove/route";
import { GET as getAuthenticatedFriends, POST as addFriendAuthEndpoint } from "@/app/api/friends/route";

let primaryUser: any;
let secondaryUser: any;

describe("Integration Test: Friends API", () => {
  beforeAll(async () => {
    await dbConnect();
    await User.deleteMany({ email: { $in: ["testuser@example.com", "frienduser@example.com"] } });

    primaryUser = await User.create({
      email: "testuser@example.com",
      vorname: "Test",
      name: "User",
      benutzername: "testuser",
      password: "password",
      freunde: [],
    });

    secondaryUser = await User.create({
      email: "frienduser@example.com",
      vorname: "Friend",
      name: "User",
      benutzername: "frienduser",
      password: "password",
      freunde: [],
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ["testuser@example.com", "frienduser@example.com"] } });
    await mongoose.connection.close();
  });

  describe("GET /api/friends/[userId]", () => {
    it("returns an empty friend list if no friends exist", async () => {
      const mockRequest = {} as Request;
      const routeParams = Promise.resolve({ userId: primaryUser._id.toString() });

      const response = await getFriendsByUser(mockRequest, { params: routeParams });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.message).toBe("Du hast keine Freunde!");
    });

    it("returns a friend list when friends exist", async () => {
      primaryUser.freunde = [{ friendId: secondaryUser._id, favourite: 0 }];
      await primaryUser.save();

      const mockRequest = {} as Request;
      const routeParams = Promise.resolve({ userId: primaryUser._id.toString() });
      const response = await getFriendsByUser(mockRequest, { params: routeParams });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      const friendData = result.data[0];
      expect(friendData._id).toBe(secondaryUser._id.toString());
      expect(friendData.vorname).toBe(secondaryUser.vorname);
      expect(friendData.name).toBe(secondaryUser.name);
      expect(friendData.benutzername).toBe(secondaryUser.benutzername);
    });
  });

  describe("PATCH /api/friends/[userId]", () => {
    it("updates the favourite status for a friend", async () => {
      primaryUser.freunde = [{ friendId: secondaryUser._id, favourite: 0 }];
      await primaryUser.save();

      const requestBody = { friendId: secondaryUser._id.toString(), favourite: true };
      const mockRequest = { json: async () => requestBody } as Request;
      const routeParams = Promise.resolve({ userId: primaryUser._id.toString() });
      const response = await updateFriendFavorite(mockRequest, { params: routeParams });
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);

      const updatedUser = await User.findById(primaryUser._id);
      const friendEntry = updatedUser?.freunde.find((entry: any) => entry.friendId.toString() === secondaryUser._id.toString());
      expect(friendEntry.favourite).toBe(1);
    });
  });

  describe("POST /api/friends/add", () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: primaryUser._id.toString() }),
      }) as any;
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("adds a friend if not already added", async () => {
      primaryUser.freunde = [];
      await primaryUser.save();

      const mockRequest = {
        json: async () => ({ friendId: secondaryUser._id.toString() }),
        headers: { get: () => "cookie=valid" },
      } as unknown as Request;

      const response = await addFriendEndpoint(mockRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.message).toBe("Freund erfolgreich hinzugefügt");

      const updatedUser = await User.findById(primaryUser._id);
      expect(updatedUser?.freunde.some((entry: any) => entry.friendId.toString() === secondaryUser._id.toString())).toBe(true);
    });

    it("returns an error if the friend is already added", async () => {
      primaryUser.freunde = [{ friendId: secondaryUser._id, favourite: 0 }];
      await primaryUser.save();

      const mockRequest = {
        json: async () => ({ friendId: secondaryUser._id.toString() }),
        headers: { get: () => "cookie=valid" },
      } as unknown as Request;

      const response = await addFriendEndpoint(mockRequest);
      expect(response.status).toBe(400);

      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Dieser Benutzer ist bereits dein Freund");
    });
  });

  describe("DELETE /api/friends/remove", () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: primaryUser._id.toString() }),
      }) as any;
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("removes a friend successfully", async () => {
      primaryUser.freunde = [{ friendId: secondaryUser._id, favourite: 0 }];
      await primaryUser.save();

      const mockRequest = {
        json: async () => ({ friendId: secondaryUser._id.toString() }),
        headers: { get: () => "cookie=valid" },
      } as unknown as Request;

      const response = await removeFriendEndpoint(mockRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.message).toBe("Freund erfolgreich entfernt");

      const updatedUser = await User.findById(primaryUser._id);
      expect(updatedUser?.freunde.some((entry: any) => entry.friendId.toString() === secondaryUser._id.toString())).toBe(false);
    });
  });

  describe("GET /api/friends (auth based)", () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: primaryUser._id.toString() }),
      }) as any;
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("returns friend list for the authenticated user", async () => {
      primaryUser.freunde = [{ friendId: secondaryUser._id, favourite: 0 }];
      await primaryUser.save();

      const mockRequest = { headers: { get: () => "cookie=valid" } } as unknown as Request;
      const response = await getAuthenticatedFriends(mockRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      const friendData = result.data[0];
      expect(friendData._id).toBe(secondaryUser._id.toString());
    });
  });

  describe("POST /api/friends (auth based)", () => {
    beforeEach(() => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: primaryUser._id.toString() }),
      }) as any;
    });
    afterEach(() => {
      jest.restoreAllMocks();
    });

    it("adds a friend via the POST route if not already added", async () => {
      primaryUser.freunde = [];
      await primaryUser.save();

      const mockRequest = {
        json: async () => ({ friendId: secondaryUser._id.toString() }),
        headers: { get: () => "cookie=valid" },
      } as unknown as Request;

      const response = await addFriendAuthEndpoint(mockRequest);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.message).toBe("Freund erfolgreich hinzugefügt");

      const updatedUser = await User.findById(primaryUser._id);
      expect(updatedUser?.freunde.some((entry: any) => entry.friendId.toString() === secondaryUser._id.toString())).toBe(true);
    });
  });
});
