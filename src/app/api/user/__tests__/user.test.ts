import { NextResponse } from "next/server";
import { GET, PUT, PATCH, DELETE } from "../[id]/route";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
const { expect, describe, it } = require('@jest/globals');
// Besserer Mock für NextResponse und Request
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

// Verbesserte Mock-Implementation
class MockRequest {
  private _body: any;
  
  constructor(body = {}) {
    this._body = body;
  }
  
  async json() {
    return this._body;
  }
}

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/User");

describe("API /api/user/[id]", () => {
  const mockId = "123";

  beforeEach(() => {
    jest.clearAllMocks();
    mockJsonResponse.mockClear();
  });

  describe("GET", () => {
    it("sollte einen User zurückgeben, wenn er gefunden wird", async () => {
      (User.findById as jest.Mock).mockResolvedValue({ _id: mockId, name: "Max" });

      const request = new MockRequest();
      const params = { id: mockId };
      const response = await GET(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(User.findById).toHaveBeenCalledWith(mockId);
      expect(data).toEqual({ success: true, data: { _id: mockId, name: "Max" } });
    });

    it("sollte eine 404 zurückgeben, wenn kein User gefunden wird", async () => {
      (User.findById as jest.Mock).mockResolvedValue(null);

      const request = new MockRequest();
      const params = { id: mockId };
      const response = await GET(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: "Benutzer nicht gefunden.",
      });
      expect(response.status).toBe(404);
    });

    it("sollte eine Fehlermeldung ausgeben, wenn ein Fehler auftritt", async () => {
      (User.findById as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const request = new MockRequest();
      const params = { id: mockId };
      const response = await GET(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({ success: false, error: "DB Error" });
      expect(response.status).toBe(400);
    });
  });

  describe("PUT", () => {
    it("sollte Daten aktualisieren und zurückgeben, wenn ein User gefunden wird", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: mockId, name: "MaxNeu",
      });

      const requestBody = { name: "MaxNeu" };
      const request = new MockRequest(requestBody);
      const params = { id: mockId };
      const response = await PUT(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        mockId,
        requestBody,
        expect.any(Object)
      );
      expect(data).toEqual({ success: true, data: { _id: mockId, name: "MaxNeu" } });
    });

    it("sollte 404 zurückgeben, wenn kein User gefunden wird", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const requestBody = { name: "Niemand" };
      const request = new MockRequest(requestBody);
      const params = { id: mockId };
      const response = await PUT(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: "Benutzer nicht gefunden.",
      });
      expect(response.status).toBe(404);
    });

    it("sollte eine Fehlermeldung ausgeben, wenn ein Fehler auftritt", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("Update Error"));

      const request = new MockRequest({});
      const params = { id: mockId };
      const response = await PUT(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({ success: false, error: "Update Error" });
      expect(response.status).toBe(400);
    });
  });

  describe("PATCH", () => {
    it("sollte Daten teilweise aktualisieren und zurückgeben, wenn ein User gefunden wird", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({
        _id: mockId, name: "MaxPatch",
      });

      const requestBody = { name: "MaxPatch" };
      const request = new MockRequest(requestBody);
      const params = { id: mockId };
      const response = await PATCH(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({ success: true, data: { _id: mockId, name: "MaxPatch" } });
    });

    it("sollte 404 zurückgeben, wenn kein User gefunden wird", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      const requestBody = { name: "NichtDa" };
      const request = new MockRequest(requestBody);
      const params = { id: mockId };
      const response = await PATCH(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: "Benutzer nicht gefunden.",
      });
      expect(response.status).toBe(404);
    });

    it("sollte eine Fehlermeldung ausgeben, wenn ein Fehler auftritt", async () => {
      (User.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error("Patch Error"));

      const request = new MockRequest({});
      const params = { id: mockId };
      const response = await PATCH(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({ success: false, error: "Patch Error" });
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE", () => {
    it("sollte einen User löschen und zurückgeben, wenn ein User gefunden wird", async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: mockId });

      const request = new MockRequest();
      const params = { id: mockId };
      const response = await DELETE(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(User.findByIdAndDelete).toHaveBeenCalledWith(mockId);
      expect(data).toEqual({ success: true, data: { _id: mockId } });
    });

    it("sollte 404 zurückgeben, wenn kein User gefunden wird", async () => {
      (User.findByIdAndDelete as jest.Mock).mockResolvedValue(null);

      const request = new MockRequest();
      const params = { id: mockId };
      const response = await DELETE(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: "Benutzer nicht gefunden.",
      });
      expect(response.status).toBe(404);
    });

    it("sollte eine Fehlermeldung ausgeben, wenn ein Fehler auftritt", async () => {
      (User.findByIdAndDelete as jest.Mock).mockRejectedValue(new Error("Delete Error"));

      const request = new MockRequest();
      const params = { id: mockId };
      const response = await DELETE(request as unknown as Request, { params: Promise.resolve(params) });
      const data = await response.json();

      expect(data).toEqual({ success: false, error: "Delete Error" });
      expect(response.status).toBe(400);
    });
  });
});