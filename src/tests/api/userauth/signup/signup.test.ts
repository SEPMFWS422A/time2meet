import { POST } from "@/app/api/userauth/signup/route";
import User from "@/lib/models/User";
import { beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import bcrypt from "bcrypt";



jest.mock("@/lib/database/dbConnect", () => jest.fn());
jest.mock("@/lib/models/User", () => ({ 
    findOne: jest.fn(),
    create: jest.fn(),
}));
jest.mock("bcrypt", () => ({
    hash: jest.fn(),
}));

describe("POST /api/userauth/signup", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });


    it("should return 400 if required fields are missing", async () => {
        const request = {
            json: jest.fn().mockResolvedValue({
                email: "test@test.com",
                password: "password"
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Alle Felder sind erforderlich." });        
    });

    it("should return 400 if user aleady exists", async () => {
        (User.findOne as jest.Mock).mockResolvedValue({ email: "test@test.com" });

        const request = {
            json: jest.fn().mockResolvedValue({
                username: "testUser",
                email: "test@test.com",
                password: "password",
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "Benutzer existiert bereits." });
    });

    it("should return 201and create a new user if user does not exist", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);
        (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
        (User.create as jest.Mock).mockResolvedValue({ 
            _id : "userID",
            email: "test@test.com",
            benutzername: "testUser",
            password: "hashedPassword",
        });

        const request = {
            json: jest.fn().mockResolvedValue({
                username: "testUser",
                email: "test@test.com",
                password: "password",
            }),
        } as unknown as NextRequest;

        const response = await POST(request);

        expect(User.create).toHaveBeenCalledWith({
            email: "test@test.com",
            benutzername: "testUser",
            password: "hashedPassword",
        });

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({
            message: "Benutzer erfolgreich registriert.",
            success: true,
            user: {
                _id: "userID",
                email: "test@test.com",
                benutzername: "testUser",
                password: "hashedPassword",
            },
        });
    });


    it("should return 500 if an error occurs", async () => {
        (User.findOne as jest.Mock).mockRejectedValue(new Error("Internal Server Error"));

        const request = {
            json: jest.fn().mockResolvedValue({
                username: "testUser",
                email: "test@test.com",
                password: "password",
            }),
        } as unknown as NextRequest;
        const response = await POST(request);

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: "Internal Server Error" });
    });
});