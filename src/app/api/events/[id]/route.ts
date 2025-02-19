import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";

// GET /api/events/[id]
// Liefert das Event inklusive populierter Gruppen
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  await dbConnect();
  const { id } = params;
  try {
    const event = await Event.findById(id).populate("groups");
    if (!event) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json(event, { status: 200 });
  } catch (error: any) {
    console.error("Fehler beim Abrufen des Events:", error);
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
    const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true }).populate("groups");
    console.log("🔍 Aktualisiertes Event:", updatedEvent);
    if (!updatedEvent) {
      return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
    }
    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error: any) {
    console.error("Fehler beim Aktualisieren des Events:", error);
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
    console.error("Fehler beim Löschen des Events:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Events." },
      { status: 500 }
    );
  }
}
