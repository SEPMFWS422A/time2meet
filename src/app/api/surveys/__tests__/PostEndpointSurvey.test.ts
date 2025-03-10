import { NextRequest, NextResponse } from "next/server";
import { POST } from "@/app/api/surveys/route";
import Survey from "@/lib/models/Survey";
import { getUserID } from "@/lib/helper";
import { surveyJoiValidationSchema } from "@/lib/validation/surveyValidation";
import dbConnect from "@/lib/database/dbConnect";
import { expect, describe, it } from '@jest/globals';

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/helper");
jest.mock("@/lib/validation/surveyValidation");
jest.mock("@/lib/models/Survey");

const mockSurvey = jest.fn();
const mockSave = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (dbConnect as jest.Mock).mockResolvedValue(undefined);
  (Survey as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
    mockSurvey(data);
    this.save = mockSave.mockResolvedValue({ ...data, _id: "test-id" });
    return this;
  });
});

describe("POST /api/survey", () => {
  describe("Authentication", () => {
    it("sollte 401 zurückgeben, wenn nicht authentifiziert", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ error: "Unauthorized", status: 401 });

      const req = { json: jest.fn().mockResolvedValue({}) } as unknown as NextRequest;
      const response = await POST(req);

      const status = response.status;
      expect(status).toBe(401);

 
      const body = await response.json();
      expect(body).toEqual({ message: "Unauthorized" });
    });
  });

  describe("Validation", () => {
    it("sollte 400 bei Validierungsfehlern zurückgeben", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ id: "user1" });
      (surveyJoiValidationSchema.validate as jest.Mock).mockReturnValue({
        error: { details: "Test error" },
        value: null,
      });

      const req = { json: jest.fn().mockResolvedValue({}) } as unknown as NextRequest;
      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        message: "Validierungsfehler",
        details: "Test error",
      });
    });
  });
  // Tests für das Erstellen von Surveys
  describe("Successful Creation", () => {
    it("sollte Umfrage mit Ersteller als Teilnehmer erstellen", async () => {
      (getUserID as jest.Mock).mockResolvedValue({ id: "user1" });
      (surveyJoiValidationSchema.validate as jest.Mock).mockReturnValue({
        error: null,
        value: { title: "Test Survey" },
      });

      const req = { json: jest.fn().mockResolvedValue({ title: "Test Survey" }) };
      const response = await POST(req as unknown as NextRequest);

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.message).toBe("Umfrage erfolgreich erstellt");
      
      // Check survey creation
      expect(mockSurvey).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Survey",
          creator: "user1",
          participants: ["user1"],
        })
      );
    });

    it("sollte Teilnehmer entduplizieren und Ersteller hinzufügen", async () => {
        (getUserID as jest.Mock).mockResolvedValue({ id: "user1" });
        (surveyJoiValidationSchema.validate as jest.Mock).mockReturnValue({
          error: null,
          value: {
            title: "Test Survey",
            participants: ["user2", "user2", "user1"],
          },
        });
  
        const req = { json: jest.fn().mockResolvedValue({}) };
        await POST(req as unknown as NextRequest);
  
        expect(mockSurvey).toHaveBeenCalledWith(
          expect.objectContaining({
            participants: ["user2", "user1"],
          })
        );
      });
    });

    describe("Error Handling", () => {
        it("sollte 500 bei Datenbankfehlern zurückgeben", async () => {
          (getUserID as jest.Mock).mockResolvedValue({ id: "user1" });
          (surveyJoiValidationSchema.validate as jest.Mock).mockReturnValue({
            error: null,
            value: { title: "Test Survey" },
          });
    
          (Survey as unknown as jest.Mock).mockImplementationOnce(() => ({
            save: jest.fn().mockRejectedValue(new Error("Database error")),
          }));
    
          const req = { json: jest.fn().mockResolvedValue({}) } as unknown as NextRequest;
          const response = await POST(req);
    
          expect(response.status).toBe(500);
          const body = await response.json();
          expect(body).toEqual({
            message: "Interner Serverfehler",
            error: "Database error",
          });
        });
      });
  });

  