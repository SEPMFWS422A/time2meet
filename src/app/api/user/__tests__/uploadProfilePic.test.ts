import { POST } from "@/app/api/user/[id]/uploadProfilePic/route";
import dbConnect from "@/lib/database/dbConnect";
import { expect, describe, it, beforeEach } from "@jest/globals";

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/User");

const mockFindByIdAndUpdate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (dbConnect as jest.Mock).mockResolvedValue(undefined); 
  
});

describe("POST /api/user/[id]/uploadProfilePic", () => {
  describe("Authentication", () => {
    it("sollte 401 zurückgeben, wenn userId fehlt", async () => {
      const req = {
        json: () => Promise.resolve({ image: "base64String" }), // Keine userId
      } as unknown as Request;

      const response = await POST(req);

      expect(response.status).toBe(401);
      expect(await response.json()).toEqual({
        success: false,
        error: "Unauthorized",
      });
    });
  });

  describe("Uploading a profile picture", () => {
    it("sollte 400 zurückgeben, wenn die Datei fehlt", async () => {
      const req = {
        json: () => Promise.resolve({ userId: "user1" }), // Kein image
      } as unknown as Request;

      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: "Fehlende Daten",
      });
    });

    it("sollte 400 zurückgeben, wenn die Datei zu groß ist", async () => {
      // Erstelle einen großen Base64-String (> 1MB)
      const largeBase64 = "data:image/png;base64," + "a".repeat(1.5 * 1024 * 1024);

      const req = {
        json: () => Promise.resolve({ userId: "user1", image: largeBase64 }),
      } as unknown as Request;

      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: "Maximale Dateigröße: 1MB",
      });
    });


    it("sollte 200 zurückgeben, wenn die Datei und die Id passen", async () => {
     // Mocke die Datenbank-Aktualisierung
     const mockUser = { _id: "user1", profilbild: "base64String" };
     mockFindByIdAndUpdate.mockResolvedValue(mockUser);

     const req = {
       json: () =>
         Promise.resolve({
           userId: "user1",
           image: "data:image/png;base64,validBase64String",
         }),
     } as unknown as Request;

     const response = await POST(req);

     expect(response.status).toBe(200);
    });
  })
});
