import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";

// Hilfsfunktion für Benutzer-Authentifizierung
export async function getCurrentUser(request: NextRequest) {
    try {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) {
            throw new Error("Keine Authentifizierung vorhanden");
        }

        // Authentifizierungs-API aufrufen
        const response = await fetch("http://localhost:3000/api/userauth/decode", {
            headers: { cookie: cookieHeader }
        });

        if (!response.ok) {
            throw new Error("Authentifizierungsfehler");
        }

        const data = await response.json();
        if (!data.id) {
            throw new Error("Keine Benutzer-ID gefunden");
        }

        // Benutzer aus der Datenbank abrufen
        const user = await User.findById(data.id);
        if (!user) {
            throw new Error("Benutzer nicht gefunden");
        }

        return user;
    } catch (error) {
        throw error;
    }
}

// GET-Methode für Events eines bestimmten Benutzers
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const currentUser = await getCurrentUser(req);
        const userId = params.id;

        // Überprüfen, ob der Benutzer existiert
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, error: "Benutzer nicht gefunden." }, { status: 404 });
        }

        // Abfrage-Parameter für Zeitraum
        const url = req.nextUrl;
        const startParam = url.searchParams.get("start");
        const endParam = url.searchParams.get("end");

        // Basisabfrage erstellen
        const query: Record<string, any> = {};

        // Zeitraum hinzufügen, wenn vorhanden
        if (startParam || endParam) {
            query.start = {};
            query.end = {};

            if (startParam) {
                query.start = { $gte: new Date(startParam) };
            }

            if (endParam) {
                const endDate = new Date(endParam);
                endDate.setHours(23, 59, 59, 999); // Ende des Tages
                query.end = { $lte: endDate };
            }
        }

        // Wenn der Benutzer seine eigenen Events abruft
        if (currentUser._id.toString() === userId) {
            // Alle Events, bei denen der Benutzer Ersteller oder Mitglied ist
            query.$or = [
                { creator: userId },
                { members: userId }
            ];
        } else {
            // Nur Events, die mit dem aktuellen Benutzer geteilt wurden
            query.$and = [
                { $or: [{ creator: userId }, { members: userId }] },
                { members: currentUser._id }
            ];
        }

        // Events abrufen und populieren
        const events = await Event.find(query)
            .populate("creator", "vorname name benutzername _id")
            .populate("members", "vorname name benutzername _id")
            .populate("groups", "groupname beschreibung")
            .select("title start end description location allday creator members groups")
            .lean();

        return NextResponse.json({ success: true, data: events }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}