import { NextRequest, NextResponse } from "next/server";
import Survey from "@/lib/models/Survey";
import dbConnect from "@/lib/database/dbConnect";
import { getUserID } from "@/lib/helper";

// GET /api/surveys/participating - Get all surveys where the current user is a participant
export async function GET(req: NextRequest) {
    await dbConnect();

    const currentUser = await getUserID(req);
    if (currentUser.error) {
        return NextResponse.json({ message: currentUser.error }, { status: currentUser.status });
    }

    try {
        // Find all surveys where current user is a participant
        const surveys = await Survey.find({
            teilnehmer: { $elemMatch: { userId: currentUser.id } }
        });
        
        return NextResponse.json(surveys);
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
    }
}