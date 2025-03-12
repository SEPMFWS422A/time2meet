
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import Group from "@/lib/models/Group";
import mongoose from "mongoose";
import { getUserID } from "@/lib/helper";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const user = await getUserID(req);
        const eventId = (await params).id as string;

        // Event abrufen und populieren
        const event = await Event.findById(eventId)
            .populate("creator", "vorname name benutzername _id")
            .populate("members", "vorname name benutzername _id")
            .populate("groups", "groupname beschreibung members")
            .select("title start end description location allday creator members groups")
            .lean();

        if (!event) {
            return NextResponse.json({ success: false, error: "Event nicht gefunden." }, { status: 404 });
        }

        // Prüfen, ob der Nutzer Zugriff auf das Event hat
        if (event.creator._id.toString() !== user.id && !event.members.some((member: any) => member._id.toString() === user.id)) {
            return NextResponse.json({ success: false, error: "Zugriff verweigert" }, { status: 403 });
        }

        return NextResponse.json({ success: true, data: event }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const user = await getUserID(req);
        const eventId = params.id;
        const body = await req.json();

        // Event abrufen
        const existingEvent = await Event.findById(eventId);
        if (!existingEvent) {
            return NextResponse.json({ success: false, error: "Event nicht gefunden." }, { status: 404 });
        }

        // Prüfen, ob der Nutzer der Ersteller ist
        if (existingEvent.creator.toString() !== user.id) {
            return NextResponse.json({ success: false, error: "Nicht berechtigt, dieses Event zu bearbeiten." }, { status: 403 });
        }

        // Sicherstellen, dass `creator` nicht geändert wird
        const updatedEvent = await Event.findByIdAndUpdate(eventId,
            { $set: { ...body, creator: existingEvent.creator } }, // `creator` bleibt gleich
            { new: true, runValidators: true }
        )
            .populate("creator", "vorname name benutzername _id")
            .populate("members", "vorname name benutzername _id")
            .populate("groups", "groupname beschreibung members")
            .select("title start end description location allday creator members groups")
            .lean();

        if (!updatedEvent) {
            return NextResponse.json({ success: false, error: "Fehler beim Aktualisieren des Events." }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: updatedEvent }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const user = await getUserID(req);
        const eventId = (await params).id as string;

        // Event abrufen
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, error: "Event nicht gefunden." }, { status: 404 });
        }

        // Prüfen, ob der Nutzer der Ersteller ist
        if (event.creator.toString() !== user.id) {
            return NextResponse.json({ success: false, error: "Nicht berechtigt, dieses Event zu löschen" }, { status: 403 });
        }

        await Event.findByIdAndDelete(eventId);

        return NextResponse.json({ success: true, message: "Event wurde gelöscht" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
