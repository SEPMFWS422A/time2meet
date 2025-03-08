import {NextRequest, NextResponse} from "next/server";
import Survey from "@/lib/models/Survey";
import dbConnect from "@/lib/database/dbConnect";
import {getUserID} from "@/lib/helper";

// DELETE /api/surveys/[id]
// Löschen von eigener Umfrage
export async function DELETE(req: NextRequest, {params}: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    await dbConnect();

    const currentUser = await getUserID(req);

    if (currentUser.error) {
        return NextResponse.json({message: currentUser.error}, {status: currentUser.status})
    }

    try {
        if (!id) return NextResponse.json({message: "Umfrage-Id muss angegeben werden"}, {status: 400});

        const deletedSurvey = await Survey.findOneAndDelete({
            _id: id,
            creator: currentUser.id
        });

        if (!deletedSurvey) {
            return NextResponse.json({message: "Umfrage nicht gefunden oder du bist nicht der Ersteller."}, {status: 404});
        }

        return NextResponse.json({message: `Die Umfrage wurde erfolgreich gelöscht.`}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error", error}, {status: 500});
    }
}
