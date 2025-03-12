import { POST } from "@/app/api/friends/add/route";
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
  ...(jest.requireActual("mongoose") as object),
  Types: {
    ObjectId: jest.fn(function(id) {
      return id;
    }),
  },
}));

// Mock global fetch
global.fetch = jest.fn();

describe("Friends Add API Route", () => {
  const mockRequest = (body = {}, headers: Record<string, string> = {}) => ({
    json: jest.fn().mockResolvedValue(body),
    headers: {
      get: jest.fn((header: string) => headers[header] || null)
    }
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it("should successfully add a friend", async () => {
    // Setup
    const request = mockRequest({ friendId: "friend123" }, { "cookie": "valid-cookie" });
    const currentUserId = "user123";
    const friendId = "friend123";
    
    // Mock fetch response for decode API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: currentUserId })
    });
    
    // Mock database calls
    (User.findById as jest.Mock)
      .mockResolvedValueOnce({ // Current user
        _id: currentUserId,
        freunde: []
      })
      .mockResolvedValueOnce({ // Friend user
        _id: friendId
      });
    
    (User.findByIdAndUpdate as jest.Mock)
      .mockResolvedValue({});
    
    // Execute
    const response = await POST(request as unknown as Request);
    const result = await response.json();
    
    // Assertions
    expect(dbConnect).toHaveBeenCalled();
    expect(request.json).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith("http://localhost:3000/api/userauth/decode", {
      headers: { cookie: "valid-cookie" }
    });
    expect(User.findById).toHaveBeenCalledWith(currentUserId);
    expect(User.findById).toHaveBeenCalledWith(friendId);
    expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(friendId);
    expect(mongoose.Types.ObjectId).toHaveBeenCalledWith(currentUserId);
    expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(2);
    expect(result.success).toBe(true);
    expect(result.message).toBe("Freund erfolgreich hinzugefügt");
  });
  
  it("should return 401 if cookie is missing", async () => {
    // Setup
    const request = mockRequest({ friendId: "friend123" }, {});
    
    // Execute
    const response = await POST(request as unknown as Request);
    const result = await response.json();
    
    // Assertions
    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Nicht authentifiziert");
    expect(global.fetch).not.toHaveBeenCalled();
  });
  
  it("should return 401 if authentication fails", async () => {
    // Setup
    const request = mockRequest({ friendId: "friend123" }, { "cookie": "invalid-cookie" });
    
    // Mock fetch response for decode API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false
    });
    
    // Execute
    const response = await POST(request as unknown as Request);
    const result = await response.json();
    
    // Assertions
    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Authentifizierungsfehler");
  });
  
  it("should return 401 if no user ID found in decoded data", async () => {
    // Setup
    const request = mockRequest({ friendId: "friend123" }, { "cookie": "valid-cookie" });
    
    // Mock fetch response for decode API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ /* no id */ })
    });
    
    // Execute
    const response = await POST(request as unknown as Request);
    const result = await response.json();
    
    // Assertions
    expect(response.status).toBe(401);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Keine Benutzer-ID gefunden");
  });
  
  it("should return 404 if current user not found", async () => {
    // Setup
    const request = mockRequest({ friendId: "friend123" }, { "cookie": "valid-cookie" });
    
    // Mock fetch response for decode API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "user123" })
    });
    
    // Mock database calls
    (User.findById as jest.Mock).mockResolvedValueOnce(null);
    
    // Execute
    const response = await POST(request as unknown as Request);
    const result = await response.json();
    
    // Assertions
    expect(response.status).toBe(404);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Aktueller Benutzer nicht gefunden");
  });
  
  it("should return 404 if friend user not found", async () => {
    // Setup
    const request = mockRequest({ friendId: "friend123" }, { "cookie": "valid-cookie" });
    
    // Mock fetch response for decode API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "user123" })
    });
    
    // Mock database calls
    (User.findById as jest.Mock)
      .mockResolvedValueOnce({ _id: "user123", freunde: [] }) // Current user
      .mockResolvedValueOnce(null); // Friend user (not found)
    
    // Execute
    const response = await POST(request as unknown as Request);
    const result = await response.json();
    
    // Assertions
    expect(response.status).toBe(404);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Freund nicht gefunden");
  });
  
  it("should return 400 if users are already friends", async () => {
    // Setup
    const friendId = "friend123";
    const request = mockRequest({ friendId }, { "cookie": "valid-cookie" });
    
    // Mock fetch response for decode API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "user123" })
    });
    
    // Mock database calls
    (User.findById as jest.Mock)
      .mockResolvedValueOnce({ 
        _id: "user123", 
        freunde: [{ friendId: { toString: () => friendId } }]
      })
      .mockResolvedValueOnce({ _id: friendId });
    
    // Execute
    const response = await POST(request as unknown as Request);
    const result = await response.json();
    
    // Assertions
    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Dieser Benutzer ist bereits dein Freund");
  });
  
  it("should handle errors properly", async () => {
    // Setup
    const request = mockRequest({ friendId: "friend123" }, { "cookie": "valid-cookie" });
    
    // Mock fetch response for decode API
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "user123" })
    });
    
    // Mock database error
    (User.findById as jest.Mock).mockRejectedValue(new Error("Database connection error"));
    
    // Execute
    const response = await POST(request as unknown as Request);
    const result = await response.json();
    
    // Assertions
    expect(response.status).toBe(500);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Database connection error");
  });
});