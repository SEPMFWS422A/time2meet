import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";

// 🔹 Neue Hilfsfunktion für die Benutzer-Authentifizierung (analog zur Friends-API)
async function getCurrentUser(request: NextRequest) {
    try {
        const cookieHeader = request.headers.get("cookie");
        if (!cookieHeader) {
            throw new Error("Keine Authentifizierung vorhanden");
        }

        // Authentifizierungs-API aufrufen (wie in der Friends-API)
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

// 🔹 GET-Methode für Events (angepasst an Friends-API)
export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        // Authentifizierung des Benutzers abrufen
        const currentUser = await getCurrentUser(req);

        // Alle Events abrufen, bei denen der Nutzer entweder Ersteller oder Mitglied ist
        const events = await Event.find({
            $or: [{ creator: currentUser._id }, { members: currentUser._id }]
        })
            .populate("creator", "vorname name benutzername _id")
            .populate("members", "vorname name benutzername _id")
            .populate("groups", "groupname beschreibung members")
            .select("title start end description location allday creator members groups")
            .lean() || [];

        if (!events || events.length === 0) {
            return NextResponse.json({ success: true, data: [], message: "Keine Events gefunden." });
        }

        return NextResponse.json({ success: true, data: events }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 401 });
    }
}

// 🔹 POST-Methode für Events (angepasst an Friends-API)
export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        // Authentifizierung des Benutzers abrufen
        const currentUser = await getCurrentUser(req);

        // Body der Anfrage auslesen
        const { title, start, end, description, location, groups, members, allday } = await req.json();

        // Pflichtfelder validieren
        if (!title || !start) {
            return NextResponse.json({ success: false, error: "Title und Start-Datum sind erforderlich." }, { status: 400 });
        }

        // Neues Event erstellen
        const newEvent = new Event({
            creator: currentUser._id,  // Ersteller ist der eingeloggte Benutzer
            members,
            title,
            start,
            end: allday ? undefined : end, // Falls `allDay`, dann kein `end`
            description,
            location,
            groups,
            allday,
        });

        // Event speichern
        const savedEvent = await newEvent.save();

        return NextResponse.json({ success: true, data: savedEvent }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: `Fehler beim Erstellen des Events: ${error.message}` }, { status: 500 });
    }
}
