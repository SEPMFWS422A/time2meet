import { GET } from "@/app/api/friends/search/route";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
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
jest.mock("@/lib/models/User", () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    find: jest.fn()
  }
}));

// Mock global fetch
global.fetch = jest.fn();

describe("Friends Search API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/friends/search", () => {
    it("should return search results with friend status", async () => {
      // Mock request with query
      const mockRequest = {
        url: "http://localhost:3000/api/friends/search?query=johndoe",
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Mock successful auth response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: "user123" })
      });

      // Mock current user with friends
      const mockCurrentUser = {
        _id: "user123",
        freunde: [
          { friendId: { toString: () => "friend1" } },
          { friendId: { toString: () => "friend2" } }
        ]
      };

      // Mock search results
      const mockSearchResults = [
        {
          _id: { toString: () => "friend1" },
          vorname: "John",
          name: "Doe",
          benutzername: "johndoe",
          email: "john@example.com",
          profilbild: "profile1.jpg",
          toObject: () => ({
            _id: "friend1",
            vorname: "John",
            name: "Doe",
            benutzername: "johndoe",
            email: "john@example.com",
            profilbild: "profile1.jpg"
          })
        },
        {
          _id: { toString: () => "user123" },
          vorname: "Current",
          name: "User",
          benutzername: "currentuser",
          email: "current@example.com",
          profilbild: "profile_current.jpg",
          toObject: () => ({
            _id: "user123", 
            vorname: "Current",
            name: "User",
            benutzername: "currentuser",
            email: "current@example.com",
            profilbild: "profile_current.jpg"
          })
        },
        {
          _id: { toString: () => "user789" },
          vorname: "Jane",
          name: "Smith",
          benutzername: "janesmith",
          email: "jane@example.com",
          profilbild: "profile3.jpg",
          toObject: () => ({
            _id: "user789",
            vorname: "Jane",
            name: "Smith",
            benutzername: "janesmith",
            email: "jane@example.com",
            profilbild: "profile3.jpg"
          })
        }
      ];

      // Setup mocks
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue(mockCurrentUser);
      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockSearchResults)
        })
      });

      // Execute
      const response = await GET(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(dbConnect).toHaveBeenCalled();
      expect(mockRequest.headers.get).toHaveBeenCalledWith("cookie");
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/userauth/decode", {
        headers: { cookie: "session=test-cookie" }
      });
      expect(User.findById).toHaveBeenCalledWith("user123");
      expect(User.find).toHaveBeenCalledWith({
        $or: [
          { vorname: { $regex: "johndoe", $options: "i" } },
          { name: { $regex: "johndoe", $options: "i" } },
          { benutzername: { $regex: "johndoe", $options: "i" } },
          { email: { $regex: "johndoe", $options: "i" } }
        ]
      });
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      
      // Check that friend status is correctly assigned
      expect(result.data[0].isFriend).toBe(true);
      expect(result.data[1].isCurrentUser).toBe(true);
      expect(result.data[2].isFriend).toBe(false);
      expect(result.data[2].isCurrentUser).toBe(false);
    });

    it("should return 400 when search query is too short", async () => {
      // Mock request with short query
      const mockRequest = {
        url: "http://localhost:3000/api/friends/search?query=j",
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Execute
      const response = await GET(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Suchbegriff muss mindestens 2 Zeichen lang sein");
    });

    it("should return 401 when no cookie is present", async () => {
      // Mock request with no cookie
      const mockRequest = {
        url: "http://localhost:3000/api/friends/search?query=john",
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      };

      // Execute
      const response = await GET(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Nicht authentifiziert");
    });

    it("should return 401 when authentication fails", async () => {
      // Mock request
      const mockRequest = {
        url: "http://localhost:3000/api/friends/search?query=john",
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Mock failed auth response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      // Execute
      const response = await GET(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentifizierungsfehler");
    });

    it("should return 401 when no user ID is found", async () => {
      // Mock request
      const mockRequest = {
        url: "http://localhost:3000/api/friends/search?query=john",
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Mock auth response with no user ID
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: null })
      });

      // Execute
      const response = await GET(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Keine Benutzer-ID gefunden");
    });

    it("should return 404 when current user not found", async () => {
      // Mock request
      const mockRequest = {
        url: "http://localhost:3000/api/friends/search?query=john",
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Mock successful auth response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: "user123" })
      });

      // Mock user not found
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue(null);

      // Execute
      const response = await GET(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Aktueller Benutzer nicht gefunden");
    });

    it("should return empty array when no users match search criteria", async () => {
      // Mock request
      const mockRequest = {
        url: "http://localhost:3000/api/friends/search?query=nonexistent",
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Mock successful auth response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: "user123" })
      });

      // Mock current user
      const mockCurrentUser = {
        _id: "user123",
        freunde: []
      };

      // Mock empty search results
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockResolvedValue(mockCurrentUser);
      (User.find as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([])
        })
      });

      // Execute
      const response = await GET(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it("should handle database errors properly", async () => {
      // Mock request
      const mockRequest = {
        url: "http://localhost:3000/api/friends/search?query=john",
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Mock successful auth response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: "user123" })
      });

      // Mock database error
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findById as jest.Mock).mockRejectedValue(new Error("Database connection failed"));

      // Execute
      const response = await GET(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Database connection failed");
    });
  });
});