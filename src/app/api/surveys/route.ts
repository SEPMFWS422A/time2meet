import { NextRequest, NextResponse } from "next/server";
import Survey from "@/lib/models/Survey";
import dbConnect from "@/lib/database/dbConnect";
import { getUserID } from "@/lib/helper";
import { surveyJoiValidationSchema } from "@/lib/validation/surveyValidation";
import { ISurveyPostBody } from "@/lib/interfaces/ISurveyPostBody";

// POST /api/survey - Neue Umfrage erstellen
export async function POST(req: NextRequest) {
    await dbConnect();

    const currentUser = await getUserID(req);
    if (currentUser.error) {
        return NextResponse.json({ message: currentUser.error }, { status: currentUser.status });
    }

    try {
        const body = await req.json();
        // Validation mit Joi siehe: @/lib/validation/surveyValidation"
    const { error, value } = surveyJoiValidationSchema.validate(body);
    if (error) {
      return NextResponse.json(
        { message: 'Validierungsfehler', details: error.details },
        { status: 400 }
      );
    }
    const validatedBody :ISurveyPostBody = value;
    //Wenn die Validation erfolgreich war und keine Fehler zurück kommt, werden die Values übernommen und eine neue Survey wird erstellt
    const newSurvey = new Survey({
        ...validatedBody,
        creator: currentUser.id,
        //Creator immer als Participant einfügen
        participants: value.participants 
          ? [...new Set([...value.participants, currentUser.id])]
          : [currentUser.id]
      });

        await newSurvey.save();

        return NextResponse.json({ message: "Umfrage erfolgreich erstellt", survey: newSurvey }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Interner Serverfehler", error: error.message }, { status: 500 });
    }
}
