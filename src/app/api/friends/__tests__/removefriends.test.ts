import { DELETE } from "@/app/api/friends/remove/route";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import { beforeEach, describe, expect, it} from '@jest/globals';

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

// Mock global fetch
global.fetch = jest.fn();

describe("Friends Remove API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("DELETE /api/friends/remove", () => {
    it("should successfully remove a friend", async () => {
      // Mock request data
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ friendId: "friend123" }),
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Mock successful auth response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ id: "user123" })
      });

      // Mock successful database operations
      (dbConnect as jest.Mock).mockResolvedValue(undefined);
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      // Execute
      const response = await DELETE(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(dbConnect).toHaveBeenCalled();
      expect(mockRequest.headers.get).toHaveBeenCalledWith("cookie");
      expect(fetch).toHaveBeenCalledWith("http://localhost:3000/api/userauth/decode", {
        headers: { cookie: "session=test-cookie" }
      });
      
      // Check that both users' friend connections are removed
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "user123", 
        { $pull: { freunde: { friendId: "friend123" } } }
      );
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "friend123", 
        { $pull: { freunde: { friendId: "user123" } } }
      );
      
      expect(result.success).toBe(true);
      expect(result.message).toBe("Freund erfolgreich entfernt");
    });

    it("should return 401 when no cookie is present", async () => {
      // Mock request with no cookie
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ friendId: "friend123" }),
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      };

      // Execute
      const response = await DELETE(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Nicht authentifiziert");
    });

    it("should return 401 when authentication fails", async () => {
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ friendId: "friend123" }),
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
      const response = await DELETE(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Authentifizierungsfehler");
    });

    it("should return 401 when no user ID is found", async () => {
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ friendId: "friend123" }),
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
      const response = await DELETE(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Keine Benutzer-ID gefunden");
    });

    it("should handle database errors properly", async () => {
      // Mock request
      const mockRequest = {
        json: jest.fn().mockResolvedValue({ friendId: "friend123" }),
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
      const dbError = new Error("Database connection failed");
      (User.findByIdAndUpdate as jest.Mock).mockRejectedValueOnce(dbError);

      // Execute
      const response = await DELETE(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Database connection failed");
    });

    it("should handle parsing errors in request body", async () => {
      // Mock request that throws during JSON parsing
      const mockRequest = {
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
        headers: {
          get: jest.fn().mockReturnValue("session=test-cookie")
        }
      };

      // Execute
      const response = await DELETE(mockRequest as unknown as Request);
      const result = await response.json();

      // Assertions
      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid JSON");
    });
  });
});