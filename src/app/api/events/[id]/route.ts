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
