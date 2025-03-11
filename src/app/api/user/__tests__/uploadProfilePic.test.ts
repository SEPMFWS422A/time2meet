import { POST } from "@/app/api/user/[id]/uploadProfilePic/route";
import dbConnect from "@/lib/database/dbConnect";
import { expect, describe, it, beforeEach } from "@jest/globals";

jest.mock("@/lib/database/dbConnect");
jest.mock("@/lib/models/User");

beforeEach(() => {
  jest.clearAllMocks();
  (dbConnect as jest.Mock).mockResolvedValue(undefined); 
  
});

describe("POST /api/user/[id]/uploadProfilePic", () => {
  describe("Authentication", () => {
    it("sollte 401 zurückgeben, wenn userId fehlt", async () => {
      const formData = new FormData();
      const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });
      formData.append("profilbild", mockFile);

      const req = {
        formData: () => Promise.resolve(formData),
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
      const formData = new FormData();
      formData.append("userId", "user1");

      const req = {
        formData: () => Promise.resolve(formData),
      } as unknown as Request;

      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: "Fehlende Daten",
      });
    });

    it("sollte 400 zurückgeben, wenn die Datei zu groß ist", async () => {
      const formData = new FormData();
      formData.append("userId", "user1");
      const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });
      formData.append("profilbild", largeFile);

      const req = {
        formData: () => Promise.resolve(formData),
      } as unknown as Request;

      const response = await POST(req);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: "Maximale Dateigröße: 1MB",
      });
    });

    // Leider ist es mir nicht gelungen, den Test vollständig zu mocken, sodass beim Ausführen eine neue Datei erstellt wird.  
    // Daher habe ich ein 'x' vor 'it' gesetzt, um den Test zu überspringen.  
    // Er funktioniert jedoch, und man kann ihn ausführen. Vergesst aber nicht, die erstellte Datei anschließend zu löschen.
    xit("sollte 200 zurückgeben, wenn die Datei und die Id passen", async () => {
      const formData = new FormData();
      formData.append("userId", "user1");
      const largeFile = new File([new ArrayBuffer(1 * 1024 * 1024)], "normal.jpg", {
        type: "image/jpeg",
      });
      formData.append("profilbild", largeFile);

      const req = {
        formData: () => Promise.resolve(formData),
      } as unknown as Request;

      const response = await POST(req);

      expect(response.status).toBe(200);
      expect(await response.json()).toEqual({
        success: true,
      });
    });


  })
});
