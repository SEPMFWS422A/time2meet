import { POST } from "@/app/api/userauth/login/route";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { NextRequest } from "next/server";



describe("Integration Test: login API", () => {

    beforeAll(async () => {
        await dbConnect();
        let retries = 0;
        while (mongoose.connection.readyState !== 1 && retries < 10) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries++;
        }
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Mongoose-Verbindung konnte nicht verbinden.");
        }

        await User.deleteMany({ email: { $in: ["test@test.com", "notfound@test.com"] } });

        const hashedPassword = await bcrypt.hash("password", 10);
        await User.create({
            email: "test@test.com",
            password: hashedPassword,
            benutzername: "testUser",
        });
    });

    afterAll(async () => {
        await User.deleteMany({ email: { $in: ["test@test.com", "notfound@test.com"] } });
        await mongoose.connection.close();
    });


    it("should return 200 and a message on successful login", async () => {
        const request = {
            json: async () => ({ email: "test@test.com", password: "password" }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.message).toBe("Login successful");
    });


    it("should return 400 if password is incorrect", async () => {
        const request = {
            json: async () => ({ email: "test@test.com", password: "wrongpassword" }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("Login fehlgeschlagen");
    });

    it("should return 404 if user does not exist", async () => {
        const request = {
            json: async () => ({ email: "notfound@test.com", password: "password" }),
        } as unknown as NextRequest;

        const response = await POST(request);
        expect(response.status).toBe(404);
        const data = await response.json();
        expect(data.success).toBe(false);
        expect(data.error).toBe("Login fehlgeschlagen");
    });
})