import {NextRequest, NextResponse} from "next/server";
import Survey from "@/lib/models/Survey";
import dbConnect from "@/lib/database/dbConnect";
import {getUserID} from "@/lib/helper";

// DELETE /api/surveys/[id]
// Löschen von eigener Umfrage
export async function DELETE(req: NextRequest, {params}: { params: { id: string } }) {
    await dbConnect();

    const currentUser = await getUserID(req);
    if (currentUser.error) {
        return NextResponse.json({message: currentUser.error}, {status: currentUser.status})
    }

    try {
        const { id } = params;
        if (!id) return NextResponse.json({message: "Umfrage ID muss angegeben werden"}, {status: 400});

        const survey = await Survey.findById(id);
        if (!survey) return NextResponse.json({message: "Umfrage nicht gefunden."}, {status: 404});

        if (survey.ersteller.toString() !== currentUser.id) return NextResponse.json({message: "Nicht berechtigt, diese Umfrage zu löschen."}, {status: 403});

        await Survey.findByIdAndDelete(id);
        return NextResponse.json({message: `Umfrage mit ID ${id} gelöscht.`}, {status: 200});
    } catch (error) {
        return NextResponse.json({message: "Internal Server Error", error}, {status: 500});
    }
}