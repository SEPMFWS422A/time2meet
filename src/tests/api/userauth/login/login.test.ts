import User from "@/lib/models/User";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/userauth/login/route";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.mock("@/lib/database/dbConnect", () => jest.fn());
jest.mock("@/lib/models/User", () => ({
    findOne: jest.fn(),
}));
jest.mock("bcrypt", () => ({
    compare: jest.fn(),
}));
jest.mock("jsonwebtoken", () => ({
    sign: jest.fn(),
}));


describe("POST /api/userauth/login", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 404 if user is not found", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        const request = {
            json: jest.fn().mockResolvedValue({
                 email: "test@test.com",
                 password: "password",
                }),
        } as unknown as NextRequest;  

        const response = await POST(request);

        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: "Login fehlgeschlagen" });
    });

    it("should return 400 if password is incorrect", async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            email: "test@test.com",
            password: "hashedPassword",
        });
        (bcrypt.compare as jest.Mock).mockResolvedValue(false);

        const request = {
            json: jest.fn().mockResolvedValue({
                email: "test@test.com",
                passeord: "wrongPassword",
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Login fehlgeschlagen" });
    });

    it("should return 200 and set a cookie if login is successful", async () => {
        (User.findOne as jest.Mock).mockResolvedValue({
            _id: "testID",
            email: "test@test.com",
            username: "testUser",
            password: "hashedPassword",
        });

        (bcrypt.compare as jest.Mock).mockResolvedValue(true);
        (jwt.sign as jest.Mock).mockReturnValue("testToken");

        const request = {
            json: jest.fn().mockResolvedValue({
                email: "test@test.com",
                password: "password",
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ message: "Login successful", success: true });
    });

    it("should return 500 if an error occurs", async () => {
        (User.findOne as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));
    
        const req = {
          json: jest.fn().mockResolvedValue({ email: "test@test.com", password: "password" }),
        } as unknown as NextRequest;
    
        const res = await POST(req);
    
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: "Internal Server Error" });
      });
})