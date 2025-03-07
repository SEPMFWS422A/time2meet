import React from "react";
import { Card } from "@heroui/react";
import TabView from "@/components/TabView";
import { ClipboardIcon, ClipboardPenIcon } from "lucide-react";
import CreateSurvey from "@/components/CreateSurvey";
import SurveyList from "@/components/SurveyList";

interface DaySchedule {
    date: string;
    timeSlots: string[];
}

interface Survey {
    id: string;
    title: string;
    description: string;
    options: string[];
    schedule: DaySchedule[];
    status: "aktiv" | "entwurf" | "geschlossen";
}

export default function SurveyTab() {
    const createdSurveys: Survey[] = [
        {
            id: "1",
            title: "Freizeitaktivität",
            description: "Wählt eine Aktivität für das Wochenende",
            options: ["Kino", "Bowling", "Escape Room"],
            status: "entwurf",
            schedule: []
        },
        {
            id: "2",
            title: "Teammeeting",
            description: "Finde den besten Termin für das Meeting",
            options: [],
            status: "geschlossen",
            schedule: [
                { date: "2024-05-10", timeSlots: ["10:00-11:00", "11:00-12:00"] },
                { date: "2024-05-11", timeSlots: ["14:00-15:00", "15:00-16:00"] }
            ]
        }
    ];

    const receivedSurveys: Survey[] = [
        {
            id: "3",
            title: "Kinoabend",
            description: "Welche Aktivität bevorzugt ihr?",
            options: ["Kino", "Brettspiele", "Barbesuch"],
            status: "aktiv",
            schedule: []
        },
        {
            id: "4",
            title: "Geburtstagsfeier",
            description: "Ich möchte gerne meinen Geburtstag nachfeiern und möchte wissen, worauf ihr Lust und wann ihr Zeit habt?",
            options: ["Kino", "Brettspiele", "Barbesuch"],
            status: "aktiv",
            schedule: [
                { date: "2024-06-15", timeSlots: ["18:00-19:00", "19:00-20:00"] },
                { date: "2024-06-16", timeSlots: ["18:00-19:00", "19:00-20:00"] },
                { date: "2024-06-17", timeSlots: ["18:00-19:00", "19:00-20:00"] },
            ]
        }
    ];

    return (
        <div className="p-4">
            <TabView
                tabs={[
                    {
                        title: "Selbsterstellte Umfragen",
                        content: (
                            <div>
                                <CreateSurvey />
                                <Card className="w-full p-4">
                                    <SurveyList surveyList={createdSurveys} />
                                </Card>
                            </div>
                        ),
                        icon: <ClipboardPenIcon />,
                    },
                    {
                        title: "Erhaltene Umfragen",
                        content: (
                            <Card className="w-full p-4">
                                <SurveyList surveyList={receivedSurveys} />
                            </Card>
                        ),
                        icon: <ClipboardIcon />,
                    },
                ]}
                selectedTab="Selbsterstellte Umfragen"
            />
        </div>
    );
}
