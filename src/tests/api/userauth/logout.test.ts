import { GET } from "@/app/api/userauth/logout/route";
import { describe, expect, it } from "@jest/globals";
import { NextResponse } from "next/server";



jest.mock("@/lib/database/dbConnect", () => jest.fn());
jest.mock("@/lib/models/User", () => ({ findOne: jest.fn() }));
jest.mock("jsonwebtoken", () => ({ sign: jest.fn() }));


describe("POST /api/userauth/logout", () => {
    it("should return 200 and delete the token from the cookie", async () => {
        const response = await GET();

        console.log("cookies: ", response.cookies);
        console.log("response: ", response);

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ Message: "Logout successful", success: true });
        expect(response.cookies.get("token")).toBeUndefined();
    });


    it("should return 500 if an error occurs", async () => {
        jest.spyOn(NextResponse, "json").mockImplementationOnce(() => {
            throw new Error("Server error");
        }
        );

        const response = await GET();

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: "Server error" });
    });

});