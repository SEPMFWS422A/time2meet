import { POST } from "@/app/api/user/[id]/uploadProfilePic/route";
import dbConnect from "@/lib/database/dbConnect";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import User from "@/lib/models/User";

describe("Integration Test: Upload Profile Picture endpoint", () => {
    const userId = "67d1dfe10b3e48ed6aaa4f23"; // Vorhandene userId von dem Test user in der DB
    let originalProfilePicture: string | null = null;

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

        const user = await User.findById(userId);
        if (user) {
            originalProfilePicture = user.profilbild;
        }
    });

    afterAll(async () => {
        if (userId) {
            await User.findByIdAndUpdate(userId, { profilbild: originalProfilePicture });
        }
        await mongoose.disconnect();
    });

    beforeEach(() => {
        jest.restoreAllMocks();
    });

    it("should upload a profile picture and return 200 status code", async () => {
        const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8ZAAAAABJRU5ErkJggg==";

        const request = new NextRequest("http://localhost/api/user/[id]/uploadProfilePic", {
            method: "POST",
            body: JSON.stringify({ userId, image }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.profilbild).toBe(image);
    });

    it("should give an error if no Image was provided", async () => {

        const request = new NextRequest("http://localhost/api/user/[id]/uploadProfilePic", {
            method: "POST",
            body: JSON.stringify({ userId}),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Fehlende Daten');
    });
    it("should give an 'Unauthorized' error if no User was provided", async () => {
        const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8ZAAAAABJRU5ErkJggg==";

        const request = new NextRequest("http://localhost/api/user/[id]/uploadProfilePic", {
            method: "POST",
            body: JSON.stringify({ image}),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.error).toBe('Unauthorized');
    });
    it("should return 400 status code if image size exceeds 1MB", async () => {
        const largeImage = "data:image/png;base64," + "a".repeat(3 * 1024 * 1024); //3Mb bild

        const request = new NextRequest("http://localhost/api/user/[id]/uploadProfilePic", {
            method: "POST",
            body: JSON.stringify({ userId, image: largeImage }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Maximale Dateigröße: 1MB");
    });
});
