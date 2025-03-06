import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import Group from "@/lib/models/Group";


export async function GET() {
    await dbConnect();
    try {
        const events = await Event.find()
            .populate({
                path: "creator",
                model: User,
                select: "vorname name benutzername _id",
            })
            .populate({
                path: "members",
                model: User,
                select: "vorname name benutzername _id",
            })
            .populate({
                path: "groups",
                model: Group,
                select: "groupname beschreibung members",
            })
            .select("title start end description location allday creator members groups");

        if (!events || events.length === 0) {
            return NextResponse.json(
                { error: "Keine Events gefunden." },
                { status: 404 }
            );
        }

        return NextResponse.json(events, { status: 200 });
    } catch (error: any) {
        console.error("❌ Fehler beim Abrufen der Events:", error);
        return NextResponse.json(
            { error: "Fehler beim Abrufen der Events." },
            { status: 500 }
        );
    }
}

// POST /api/events
// Erstellt ein neues Event
export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        console.log("📥 API erhält folgende Daten:", body); // DEBUGGING

        const { creator, title, start, end, description, location, groups, members, allday } = body;

        if (!creator || !title || !start) {
            console.log("❌ Fehlende Pflichtfelder in API:", { creator, title, start });
            return NextResponse.json(
                { error: "creator, title und start sind erforderlich." },
                { status: 400 }
            );
        }

        const newEvent = await Event.create({
            creator,
            members,
            title,
            start,
            end: allday ? undefined : end, // Falls `allDay`, kein `end`
            description,
            location,
            groups,
            allday,
        });

        console.log("✅ Event erfolgreich gespeichert:", newEvent);
        return NextResponse.json(newEvent, { status: 201 });
    } catch (error: any) {
        console.error("❌ API ERROR:", error);
        return NextResponse.json(
            { error: `Fehler beim Erstellen des Events: ${error.message}` },
            { status: 500 }
        );
    }
}
