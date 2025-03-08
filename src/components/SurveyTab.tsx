import React, {useEffect, useState} from "react";
import {Card} from "@heroui/react";
import TabView from "@/components/TabView";
import {ClipboardIcon, ClipboardPenIcon} from "lucide-react";
import CreateSurvey from "@/components/CreateSurvey";
import SurveyList from "@/components/SurveyList";
import axios from "axios";

interface DaySchedule {
    date: string;
    timeSlots: string[];
}

interface Survey {
    _id: string;
    title: string;
    description: string;
    creator: string;
    options: string[];
    schedule: DaySchedule[];
    status: "aktiv" | "entwurf" | "geschlossen";
}

interface Notification {
    message: string;
    type: "success" | "error";
}

export default function SurveyTab() {
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notification | null>();

    useEffect(() => {
        const decodeToken = async () => {
            try {
                const res = await fetch("/api/userauth/decode", {
                    credentials: "include"
                });
                const data = await res.json();
                if (data.id) {
                    setLoggedInUserId(data.id);
                } else {
                    console.error("Token not found on server:", data);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        };
        decodeToken();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const [surveys, setSurveys] = useState<Survey[]>([
        {
            _id: "1",
            title: "Freizeitaktivität",
            description: "Wählt eine Aktivität für das Wochenende",
            creator: "67ca0e0ee1fde21758c3afe6",
            options: ["Kino", "Bowling", "Escape Room"],
            status: "entwurf",
            schedule: []
        },
        {
            _id: "2",
            title: "Teammeeting",
            description: "Finde den besten Termin für das Meeting",
            creator: "67ca0e0ee1fde21758c3afe6",
            options: [],
            status: "geschlossen",
            schedule: [
                {date: "2024-05-10", timeSlots: ["10:00-11:00", "11:00-12:00"]},
                {date: "2024-05-11", timeSlots: ["14:00-15:00", "15:00-16:00"]}
            ]
        },
        {
            _id: "3",
            title: "Kinoabend",
            description: "Welche Aktivität bevorzugt ihr?",
            creator: "67c5632c1424a8f615090b09",
            options: ["Kino", "Brettspiele", "Barbesuch"],
            status: "aktiv",
            schedule: []
        },
        {
            _id: "4",
            title: "Geburtstagsfeier",
            description: "Ich möchte gerne meinen Geburtstag nachfeiern und möchte wissen, worauf ihr Lust und wann ihr Zeit habt?",
            creator: "67c5632c1424a8f615090b09",
            options: ["Kino", "Brettspiele", "Barbesuch"],
            status: "aktiv",
            schedule: [
                {date: "2024-06-15", timeSlots: ["18:00-19:00", "19:00-20:00"]},
                {date: "2024-06-16", timeSlots: ["18:00-19:00", "19:00-20:00"]},
                {date: "2024-06-17", timeSlots: ["18:00-19:00", "19:00-20:00"]},
            ]
        }
    ];

    // Funktion zum Löschen der Umfrage
    const deleteSurvey = (surveyId: string) => {
        if (!surveyId) {
            setNotification({message: "Fehler beim Löschen der Umfrage!", type: "error"});
        }
        setSurveys((prevSurveys) => prevSurveys.filter((survey) => survey._id !== surveyId));
        setNotification({message: "Umfrage erfolgreich gelöscht!", type: "success"});
    };

    const createdSurveys = surveys.filter((survey) => survey.creator === loggedInUserId);
    const receivedSurveys = surveys.filter((survey) => survey.creator !== loggedInUserId);

    return (
        <div className="p-4">
            {notification && (
                <div
                    className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow z-50">
                    {notification.message}
                </div>
            )}
            <TabView
                tabs={[
                    {
                        title: "Selbsterstellte Umfragen",
                        content: (
                            <div>
                                <CreateSurvey/>
                                <Card className="w-full p-4">
                                    <SurveyList surveyList={createdSurveys} onDeleteSurvey={deleteSurvey}
                                                isCreatedByCurrentUser={true}/>
                                </Card>
                            </div>
                        ),
                        icon: <ClipboardPenIcon/>,
                    },
                    {
                        title: "Erhaltene Umfragen",
                        content: (
                            <Card className="w-full p-4">
                                <SurveyList surveyList={receivedSurveys} isCreatedByCurrentUser={false}/>
                            </Card>
                        ),
                        icon: <ClipboardIcon/>,
                    },
                ]}
                selectedTab="Selbsterstellte Umfragen"
            />
        </div>
    );
}
