import { GET, PATCH } from "@/app/api/friends/[userId]/route";
import { mockDeep } from "jest-mock-extended";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import mongoose from "mongoose";
import { beforeEach, describe, expect, it } from '@jest/globals';
// Mock dependencies
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ 
      json: () => Promise.resolve(data), 
      status: options?.status || 200 
    })),
  },
}));

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/User");
jest.mock("mongoose", () => ({
  ...jest.requireActual("mongoose"),
  Types: {
    ObjectId: jest.fn(function(id) {
      return id;
    }),
  },
}));

describe("Friends API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/friends/[userId]", () => {
    it("should return user's friends with favorite status", async () => {
      // Mock data
      const userId = "user123";
      const mockUser = {
        freunde: [
          { friendId: "friend1", favourite: 1 },
          { friendId: "friend2", favourite: 0 }
        ],
      };

      const mockFriends = [
        { 
          _id: "friend1", 
          vorname: "John", 
          name: "Doe", 
          benutzername: "johndoe", 
          profilbild: "profile1.jpg",
          toObject: () => ({ 
            _id: "friend1", 
            vorname: "John", 
            name: "Doe", 
            benutzername: "johndoe", 
            profilbild: "profile1.jpg" 
          })
        },
        { 
          _id: "friend2", 
          vorname: "Jane", 
          name: "Smith", 
          benutzername: "janesmith", 
          profilbild: "profile2.jpg",
          toObject: () => ({ 
            _id: "friend2", 
            vorname: "Jane", 
            name: "Smith", 
            benutzername: "janesmith", 
            profilbild: "profile2.jpg" 
          })
        }
      ];

      // Setup mocks
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (User.find as jest.Mock).mockResolvedValue(mockFriends);

      // Execute
      const response = await GET({} as Request, { params: Promise.resolve({ userId }) });
      const result = await response.json();

      // Assertions
      expect(dbConnect).toHaveBeenCalled();
      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(User.find).toHaveBeenCalledWith(
        { _id: { $in: ["friend1", "friend2"] } },
        { vorname: 1, name: 1, benutzername: 1, profilbild: 1 }
      );
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].isFavourite).toBe(1);
      expect(result.data[1].isFavourite).toBe(0);
    });

    it("should return 404 if user not found", async () => {
      const userId = "nonexistent";
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue(null);

      const response = await GET({} as Request, { params: Promise.resolve({ userId }) });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error).toBe("User not found");
    });

    it("should return empty array if user has no friends", async () => {
      const userId = "lonelyUser";
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue({ freunde: [] });

      const response = await GET({} as Request, { params: Promise.resolve({ userId }) });
      const result = await response.json();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.message).toBe("Du hast keine Freunde!");
    });

    it("should handle errors properly", async () => {
      const userId = "user123";
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await GET({} as Request, { params: Promise.resolve({ userId }) });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("PATCH /api/friends/[userId]", () => {
    it("should update existing friend's favorite status", async () => {
      const userId = "user123";
      const friendId = "friend456";
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ friendId, favourite: true })
      };
      const mockUpdatedUser = { _id: userId, freunde: [{ friendId, favourite: 1 }] };

      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const response = await PATCH(mockRequest as unknown as Request, { params: Promise.resolve({ userId }) });
      const result = await response.json();

      expect(dbConnect).toHaveBeenCalled();
      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(friendId);
      expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(userId);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.anything(), "freunde.friendId": expect.anything() },
        { $set: { "freunde.$.favourite": 1 } },
        { new: true }
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedUser);
    });

    it("should add a new friend when relationship doesn't exist", async () => {
      const userId = "user123";
      const friendId = "newFriend789";
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ friendId, favourite: false })
      };
      
      const mockUpdatedUser = { _id: userId, freunde: [{ friendId, favourite: 0 }] };

      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedUser);

      const response = await PATCH(mockRequest as unknown as Request, { params: Promise.resolve({ userId }) });
      const result = await response.json();

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: expect.anything(), "freunde.friendId": expect.anything() },
        { $set: { "freunde.$.favourite": 0 } },
        { new: true }
      );
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        expect.anything(),
        { $push: { freunde: { friendId: expect.anything(), favourite: 0 } } },
        { new: true }
      );
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUpdatedUser);
    });

    it("should return 404 if user not found when adding new friend", async () => {
      const userId = "nonexistent";
      const friendId = "friend456";
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ friendId, favourite: true })
      };

      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findOneAndUpdate as jest.Mock).mockResolvedValue(null);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const response = await PATCH(mockRequest as unknown as Request, { params: Promise.resolve({ userId }) });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error).toBe("User nicht gefunden.");
    });

    it("should handle errors properly", async () => {
      const userId = "user123";
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error("Invalid request"))
      };

      (dbConnect as jest.Mock).mockResolvedValue(undefined);

      const response = await PATCH(mockRequest as unknown as Request, { params: Promise.resolve({ userId }) });
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid request");
    });
  });
});