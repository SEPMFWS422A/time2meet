import { NextRequest, NextResponse } from "next/server";
import Survey from "@/lib/models/Survey";
import dbConnect from "@/lib/database/dbConnect";
import { getUserID } from "@/lib/helper";

// GET /api/surveys/participating - Get all surveys where the user is participating
export async function GET(req: NextRequest) {
    await dbConnect();
    try {
        
        const { id, error, status } = await getUserID(req);
        if (error) {
            return NextResponse.json({ message: error }, { status });
        }
        
        const surveys = await Survey.find().lean();
        const filteredSurveys = surveys.filter(survey =>
            survey.participants.some((participant:string) => participant.toString() === id)
        );
        return NextResponse.json(filteredSurveys);
    } catch (error) {
        return NextResponse.json({ message: "Internal Server Error", error }, { status: 500 });
    }
}