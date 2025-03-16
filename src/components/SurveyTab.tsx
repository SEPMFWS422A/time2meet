'use client';

import React, { useEffect, useState } from "react";
import { Card } from "@heroui/react";
import TabView from "@/components/TabView";
import { ClipboardIcon, ClipboardPenIcon } from "lucide-react";
import CreateSurvey from "@/components/CreateSurvey";
import SurveyList from "@/components/SurveyList";
import { ISurvey } from "@/lib/interfaces/ISurvey";
import fetchParticipatingSurveys from "@/lib/api_methods/surveys/fetchParticipatingSurveys/fetchParticipatingSurveys";

interface Notification {
    message: string;
    type: "success" | "error";
}

export default function SurveyTab() {
    const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notification | null>();
    const [surveys, setSurveys] = useState<ISurvey[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");

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

    useEffect(() => {
        fetchParticipatingSurveys()
            .then((surveyList) => {
                if (surveyList && surveyList.length > 0) {
                    setSurveys(surveyList)
                } else if (surveyList && surveyList.length === 0) {
                    setError("Du hast noch keine Umfragen.")
                } else {
                    setError("Umfragen konnten nicht geladen werden")
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const createdSurveys = Array.isArray(surveys) ? surveys.filter((survey) => survey.creator === loggedInUserId) : [];
    const receivedSurveys = Array.isArray(surveys) ? surveys.filter((survey) => survey.creator !== loggedInUserId) : [];

    return (
        <div className="p-4">
            {notification && (
                <div
                    id="createdSurveyMessage"
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
                                <CreateSurvey />
                                <Card className="w-full p-4">
                                    <SurveyList error={error} loading={loading} surveyList={createdSurveys}
                                        isCreatedByCurrentUser={true} />
                                </Card>
                            </div>
                        ),
                        icon: <ClipboardPenIcon />,
                    },
                    {
                        title: "Erhaltene Umfragen",
                        content: (
                            <Card className="w-full p-4">
                                <SurveyList error={error} loading={loading} surveyList={receivedSurveys}
                                    isCreatedByCurrentUser={false} />
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
