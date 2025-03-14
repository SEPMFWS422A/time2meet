import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import mongoose from "mongoose";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import { GET as getUserData, PATCH as updateUserData, DELETE as deleteUser } from "@/app/api/user/[id]/route";

let testUser: any;

describe("Integration Test: User Profile Settings API", () => {
  beforeAll(async () => {
    await dbConnect();
    await User.deleteMany({ email: "profiletest@example.com" });
    testUser = await User.create({
      email: "profiletest@example.com",
      vorname: "Max",
      name: "Mustermann",
      benutzername: "maxmustermann",
      password: "password123",
      telefonnummer: "0123456789",
      geburtsdatum: "1990-01-01",
      profilsichtbarkeit: "öffentlich", 
      kalendersichtbarkeit: "öffentlich", 
      theme: "Hell",
      profilbild: ""
    });
  });

  afterAll(async () => {
    await User.deleteMany({ email: "profiletest@example.com" });
    await mongoose.connection.close();
  });

  describe("GET /api/user/[id]", () => {
    it("returns user data if user exists", async () => {
      const request = {} as Request;
      const params = Promise.resolve({ id: testUser._id.toString() });
      const response = await getUserData(request, { params });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.email).toBe("profiletest@example.com");
      expect(result.data.vorname).toBe("Max");
    });

    it("returns error if user does not exist", async () => {
      const request = {} as Request;
      const fakeId = new mongoose.Types.ObjectId().toString();
      const params = Promise.resolve({ id: fakeId });
      const response = await getUserData(request, { params });
      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Benutzer nicht gefunden.");
    });
  });

  describe("PATCH /api/user/[id]", () => {
    it("updates profile settings and returns updated user", async () => {
      const updatePayload = {
        vorname: "Moritz",
        telefonnummer: "+49123456789"
      };
      const request = { json: async () => updatePayload } as Request;
      const params = Promise.resolve({ id: testUser._id.toString() });
      const response = await updateUserData(request, { params });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data.vorname).toBe("Moritz");
      expect(result.data.telefonnummer).toBe("+49123456789");
      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.vorname).toBe("Moritz");
      expect(updatedUser.telefonnummer).toBe("+49123456789");
    });

    it("returns error when updating a non-existent user", async () => {
      const updatePayload = { vorname: "Test" };
      const request = { json: async () => updatePayload } as Request;
      const fakeId = new mongoose.Types.ObjectId().toString();
      const params = Promise.resolve({ id: fakeId });
      const response = await updateUserData(request, { params });
      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.success).toBe(false);
      expect(result.error).toBe("Benutzer nicht gefunden.");
    });
  });

  describe("DELETE /api/user/[id]", () => {
    it("deletes the user", async () => {
      const userToDelete = await User.create({
        email: "tobedeleted@example.com",
        vorname: "Delete",
        name: "Me",
        benutzername: "deleteme",
        password: "password",
        telefonnummer: "000",
        geburtsdatum: "2000-01-01",
        profilsichtbarkeit: "öffentlich",
        kalendersichtbarkeit: "öffentlich",
        theme: "Hell",
        profilbild: ""
      });
      const request = {} as Request;
      const params = Promise.resolve({ id: userToDelete._id.toString() });
      const response = await deleteUser(request, { params });
      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.data._id).toBe(userToDelete._id.toString());
      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });
  });
});
