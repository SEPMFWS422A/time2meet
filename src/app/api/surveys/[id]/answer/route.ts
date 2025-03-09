import dbConnect from "@/lib/database/dbConnect";
import Survey from "@/lib/models/Survey";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { surveyId: string } }) {
    await dbConnect();

    try {
        const { surveyId } = params;
        const { participantId, selectedOptions, selectedDateTimeOptions } = await req.json();
        if(!participantId || !selectedOptions || !Array.isArray(selectedOptions) || !selectedDateTimeOptions || !Array.isArray(selectedDateTimeOptions)) {
            return NextResponse.json({ success: false, error: "Ungültige Anfrage: Fehlende und/oder ungültige Parameter" }, { status: 400 });
        }

        const survey = await Survey.findById(surveyId);
        if(!survey) {
            return NextResponse.json({ success: false, error: "Umfrage nicht gefunden" }, { status: 404 });
        }

        if(!survey.participants.some((t: mongoose.Types.ObjectId) => t.toString() === participantId)) {
            return NextResponse.json({ success: false, error: "Nicht berechtigt, diese Umfrage zu beantworten." }, { status: 403 });
        }

        const participantObjectId = new mongoose.Types.ObjectId(participantId);

        selectedOptions.forEach((selectedOption: string) => {
            const optionObject = survey.options.find((o: any) => o.title === selectedOption);
            if(optionObject && !optionObject.votedBy.includes(participantObjectId)) {
                optionObject.votedBy.push(participantObjectId);
            }
        });

        selectedDateTimeOptions.forEach(({ date, startTime, endTime, vote }: { date: string; startTime: string; endTime: string; vote: 'Ja' | 'Nein' | 'Vielleicht' }) => {
            const dateOption = survey.dateTimeSelections.find((dateOpt: any) => dateOpt.date.toISOString().startsWith(date));
            if(dateOption){
                const timeSlot = dateOption.timeSlots.find((slot: any) => slot.startTime === startTime && slot.endTime === endTime);
                if(timeSlot){
                    // dieser Teilnehmer wird von allen voter listen entfernt um doppelte Einträge zu vermeiden
                    timeSlot.yesVoters = timeSlot.yesVoters.filter((v: mongoose.Types.ObjectId) => v.toString() !== participantId);
                    timeSlot.noVoters = timeSlot.noVoters.filter((v: mongoose.Types.ObjectId) => v.toString() !== participantId);
                    timeSlot.maybeVoters = timeSlot.maybeVoters.filter((v: mongoose.Types.ObjectId) => v.toString() !== participantId);

                    if(vote === 'Ja'){
                        timeSlot.yesVoters.push(participantObjectId);
                    } else if(vote === 'Nein'){
                        timeSlot.noVoters.push(participantObjectId);
                    } else if(vote === 'Vielleicht'){
                        timeSlot.maybeVoters.push(participantObjectId);
                    }
                }
            }
        });

        await survey.save();
        return NextResponse.json({ success: true, message: "Antwort erfolgreich gespeichert", survey }, { status: 200 }); 
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        
    }
}