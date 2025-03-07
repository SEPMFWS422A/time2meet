import { NextResponse } from "next/server";
import { GET, PUT, PATCH, DELETE } from "../[id]/route";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
const { expect, describe, it, beforeEach } = require('@jest/globals');

const mockJsonResponse = jest.fn();

jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any, options?: any) => {
      const response = {
        status: options?.status || 200,
        json: async () => data
      };
      mockJsonResponse(data, options);
      return response;
    }
  }
}));

class MockHttpRequest {
  private body: any;

  constructor(body = {}) {
    this.body = body;
  }

  async json() {
    return this.body;
  }
}

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/User");

describe("API /api/user/[id]", () => {
  const testUserId = "123";

  beforeEach(() => {
    jest.clearAllMocks();
    mockJsonResponse.mockClear();
  });

  describe("GET", () => {
    it("should return a user if found", async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: testUserId, name: "Max" });
      
      const request = new MockHttpRequest();
      const params = { id: testUserId };
      const response = await GET(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(User.findById).toHaveBeenCalledWith(testUserId);
      expect(data).toEqual({ success: true, data: { _id: testUserId, name: "Max" } });
    });

    it("should return 404 if the user is not found", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);
      
      const request = new MockHttpRequest();
      const params = { id: testUserId };
      const response = await GET(request as unknown as Request, { params: Promise.resolve(params) });
      
      expect(User.findById).toHaveBeenCalledWith(testUserId);
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data).toEqual({ 
        success: false, 
        error: "Benutzer nicht gefunden." 
        });
    });

    it("should return an error if the query fails", async () => {
      (User.findById as jest.Mock).mockRejectedValue(new Error("DB error"));
      
      const request = new MockHttpRequest();
      const params = { id: testUserId };
      const response = await GET(request as unknown as Request, { params: Promise.resolve(params) });
      
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ 
        success: false, 
        error: "DB error" 
        });
    });
  });

  describe("PUT", () => {
    it("should update and return user data", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: testUserId, name: "MaxUpdated" });
      
      const requestBody = { name: "MaxUpdated" };
      const request = new MockHttpRequest(requestBody);
      const params = { id: testUserId };
      const response = await PUT(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(testUserId, requestBody, expect.any(Object));
      expect(data).toEqual({ success: true, data: { _id: testUserId, name: "MaxUpdated" } });
    });

    it("should return 404 if the user is not found", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
      
      const requestBody = { name: "MaxUpdated" };
      const request = new MockHttpRequest(requestBody);
      const params = { id: testUserId };
      const response = await PUT(request as unknown as Request, { params: Promise.resolve(params) });
      
      expect(response.status).toBe(404);
    });
  });

  describe("PATCH", () => {
    it("should partially update user data", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: testUserId, name: "MaxPatch" });
      
      const requestBody = { name: "MaxPatch" };
      const request = new MockHttpRequest(requestBody);
      const params = { id: testUserId };
      const response = await PATCH(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();
      
      expect(data).toEqual({ success: true, data: { _id: testUserId, name: "MaxPatch" } });
    });
  });

  describe("DELETE", () => {
    it("should delete a user and return it", async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: testUserId });
      
      const request = new MockHttpRequest();
      const params = { id: testUserId };
      const response = await DELETE(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(testUserId);
      expect(data).toEqual({ success: true, data: { _id: testUserId } });
    });
  });
});
