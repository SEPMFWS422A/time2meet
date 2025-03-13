import User from "@/lib/models/User";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import dbConnect from "@/lib/database/dbConnect";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { POST } from "@/app/api/userauth/signup/route";
import { NextRequest } from "next/server";
import { user } from "@nextui-org/theme";




describe("Integration Test: signup API: POST /api/userauth/signup", () => {

    beforeAll(async () => {
        await dbConnect();
        await User.deleteMany({ email: { $in: ["test@test.com", "duplicate@test.com"] } });

        const hashedPassword = await bcrypt.hash("password", 10);
        await User.create({
            email: "duplicate@test.com",
            benutzername: "duplicateUser",
            password: hashedPassword,
        });
    });

    afterAll(async () => {
        await User.deleteMany({ email: { $in: ["test@test.com", "duplicate@test.com"] } });
        await mongoose.connection.close();
    });


    it("should register a new user successfully", async () => {
        const request = {
            json: async () => ({
                username: "testUser",
                email: "test@test.com",
                password: "password",
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(201);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Benutzer erfolgreich registriert.");
        expect(data.user).toHaveProperty("_id");
        expect(data.user.email).toBe("test@test.com");
        expect(data.user.benutzername).toBe("testUser");
    });

    it("should return 400 if required fields are missing", async () => {
        const request = {
            json: async () => ({
                username: "new user",
                email: "",
                password: "",
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe("Alle Felder sind erforderlich.");
    });

    it("should return 400 if user already exists", async () => {
        const request = {
            json: async () => ({
                username: "duplicateUser",
                email: "duplicate@test.com",
                password: "password",
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.error).toBe("Benutzer existiert bereits.");
    });


    it("should return 500 if an error occurs", async () => {
        jest.spyOn(User, "create").mockRejectedValueOnce(new Error("Datenbankfehler"));

        const request = {
            json: async () => ({
                username: "errorUser",
                email: "error@test.com",
                password: "password",
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(500);
        const data = await response.json();
        expect(data.error).toBe("Datenbankfehler");
    });
});