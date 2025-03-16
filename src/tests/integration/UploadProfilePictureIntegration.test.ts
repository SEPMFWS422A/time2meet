import { POST } from "@/app/api/user/[id]/uploadProfilePic/route";
import dbConnect from "@/lib/database/dbConnect";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import mongoose from "mongoose";
import User from "@/lib/models/User";
import { object } from "joi";

describe("Integration Test: Upload Profile Picture endpoint", () => {
    let testUser: any; // Test user erstellen

    beforeAll(async () => {
        await dbConnect();
        await User.deleteMany({ email: "profilePictureTest@example.com" });

            testUser = await User.create({
              email: "profilePictureTest@example.com",
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

        const userInDb = await User.findById(testUser._id);
        if (!userInDb) {
            throw new Error("Testbenutzer konnte nicht in der Datenbank gefunden werden.");
        }

        let retries = 0;
        while (mongoose.connection.readyState !== 1 && retries < 10) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            retries++;
        }
        if (mongoose.connection.readyState !== 1) {
            throw new Error("Mongoose-Verbindung konnte nicht verbinden.");
        }
    });

    afterAll(async () => {
        await User.deleteMany({ email: "profilePictureTest@example.com" });
        await mongoose.disconnect();
    });

    it("should upload a profile picture and return 200 status code", async () => {
        const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8ZAAAAABJRU5ErkJggg==";

        const request = new NextRequest("http://localhost/api/user/[id]/uploadProfilePic", {
            method: "POST",
            body: JSON.stringify({ userId: testUser._id.toString(), image }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toBeDefined();
        expect(data.data.profilbild).toBe(image);

    });

    it("should give an error if no Image was provided", async () => {

        const request = new NextRequest("http://localhost/api/user/[id]/uploadProfilePic", {
            method: "POST",
            body: JSON.stringify({ userId: testUser._id,}),
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
            body: JSON.stringify({ userId: testUser._id, image: largeImage }),
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
    it("should give an error if no user was found and return 404 status code", async () => {
        const image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wcAAgAB/1h8ZAAAAABJRU5ErkJggg==";

        const notFoundUserId = new mongoose.Types.ObjectId();


        const request = new NextRequest("http://localhost/api/user/[id]/uploadProfilePic", {
            method: "POST",
            body: JSON.stringify({ userId: notFoundUserId, image }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Benutzer nicht gefunden")

    });
});
