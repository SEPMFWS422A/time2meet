import {NextRequest, NextResponse} from "next/server";
import Survey from "@/lib/models/Survey";
import dbConnect from "@/lib/database/dbConnect";
import {getUserID} from "@/lib/helper";
import mongoose from "mongoose";

// DELETE /api/surveys/[id]
// Löschen von eigener Umfrage
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await dbConnect();

    const currentUser = await getUserID(req);

    // Überprüfe, ob der Benutzer authentifiziert ist
    if (currentUser.error) {
        return NextResponse.json({ message: currentUser.error }, { status: currentUser.status });
    }

    try {
        // Überprüfe, ob die Umfrage-ID angegeben ist
        if (!id) {
            return NextResponse.json({ message: "Umfrage-Id muss angegeben werden." }, { status: 400 });
        }

        // Überprüfe, ob die Umfrage-ID ein gültiges MongoDB-Format hat
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: "Ungültige Umfrage-Id." }, { status: 400 });
        }

        // Finde die Umfrage in der Datenbank
        const survey = await Survey.findById(id);

        // Überprüfe, ob die Umfrage existiert
        if (!survey) {
            return NextResponse.json({ message: "Umfrage nicht gefunden." }, { status: 404 });
        }

        // Überprüfe, ob der aktuelle Benutzer der Ersteller der Umfrage ist
        if (survey.creator.toString() !== currentUser.id!.toString()) {
            return NextResponse.json(
                { message: "Du bist nicht der Ersteller der Umfrage." },
                { status: 403 } // 403 Forbidden: Der Benutzer hat keine Berechtigung
            );
        }

        // Lösche die Umfrage
        await Survey.findByIdAndDelete(survey._id);

        return NextResponse.json({ message: "Die Umfrage wurde erfolgreich gelöscht." }, { status: 200 });
    } catch (error) {
        console.error("Fehler beim Löschen der Umfrage:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}

// PUT /api/surveys/[id]
// Aktualisieren von eigener Umfrage
export async function PUT(req: NextRequest, {params}: { params: { surveyId: string } }) {
    await dbConnect();

    const currentUser = await getUserID(req);
    if (currentUser.error) {
        return NextResponse.json({message: currentUser.error}, {status: currentUser.status});
    }

    try {
        const {surveyId} = params;
        const {title, description, status, location, participants} = await req.json();

        // Umfrage abrufen
        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return NextResponse.json({success: false, message: "Umfrage nicht gefunden"}, {status: 404});
        }

        // Überprüfen, ob der Benutzer der Ersteller ist
        if (survey.creator.toString() !== currentUser.id) {
            return NextResponse.json({ success: false, message: "Nicht berechtigt, diese Umfrage zu bearbeiten." }, { status: 403 });
        }

        // Aktualisierungen durchführen
        if (title) survey.title = title;
        if (description) survey.description = description;
        if (status && ["entwurf", "aktiv", "geschlossen"].includes(status)) {
            survey.status = status;
        }
        if (location) survey.location = location;


        await survey.save();

        return NextResponse.json({success: true, message: "Umfrage erfolgreich aktualisiert", survey}, {status: 200});
    } catch (error: any) {
        return NextResponse.json({ success: false, message: "Interner Serverfehler", error: error.message }, { status: 500 });
    }
}