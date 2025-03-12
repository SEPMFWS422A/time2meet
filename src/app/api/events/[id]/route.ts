import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import User from "@/lib/models/User";
import Group from "@/lib/models/Group";

// GET /api/events/[id]
// Liefert das Event inklusive populierter Gruppen, Ersteller und Mitglieder
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  try {
    const event = await Event.findById(id)
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

    if (!event) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    console.error("❌ Fehler beim Abrufen des Events:", error);
    return NextResponse.json(
        { error: "Fehler beim Abrufen des Events." },
        { status: 500 }
    );
  }
}

// PUT /api/events/[id]
// Aktualisiert das Event und gibt das aktualisierte Dokument zurück
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  try {
    const body = await request.json();
    const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true })
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

    console.log("🔍 Aktualisiertes Event:", updatedEvent);
    if (!updatedEvent) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error: any) {
    console.error("❌ Fehler beim Aktualisieren des Events:", error);
    return NextResponse.json(
        { error: "Fehler beim Aktualisieren des Events." },
        { status: 500 }
    );
  }
}

// DELETE /api/events/[id]
// Löscht das Event und gibt eine Bestätigung zurück
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  try {
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json(
        { message: "Event erfolgreich gelöscht." },
        { status: 200 }
    );
  } catch (error: any) {
    console.error("❌ Fehler beim Löschen des Events:", error);
    return NextResponse.json(
        { error: "Fehler beim Löschen des Events." },
        { status: 500 }
    );
  }
}
/*
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const user = await getUserID(req);
        const eventId = (await params).id as string;
        const body = await req.json();

        // Event abrufen
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ success: false, error: "Event nicht gefunden." }, { status: 404 });
        }

        // Prüfen, ob der Nutzer der Ersteller ist
        if (event.creator.toString() !== user.id) {
            return NextResponse.json({ success: false, error: "Nicht berechtigt, dieses Event zu bearbeiten." }, { status: 403 });
        }

        // Event aktualisieren
        const updatedEvent = await Event.findByIdAndUpdate(eventId, body, { new: true })
            .populate("creator", "vorname name benutzername _id")
            .populate("members", "vorname name benutzername _id")
            .populate("groups", "groupname beschreibung members")
            .select("title start end description location allday creator members groups")
            .lean();

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

 */