"use client";

import React from "react";
import MultipleChoiceSurvey from "@/components/MultipleChoiceSurvey";
import CreateSurvey from "@/components/CreateSurvey";
import DateSurvey from "@/components/DateSurvey";

export default function About() {

    return (

        <div>
            <div>

                <CreateSurvey/>
                <MultipleChoiceSurvey
                    options={['option1', 'option2', 'option45']}
                    title="Meine Umfrage"
                    description="Eine coole Umfrage"/>
            </div>
            <DateSurvey
                title="Terminfindung für das nächste Teammeeting"
                description="Bitte geben Sie Ihre Präferenzen für die folgenden Termine an."
                timeSlots={{
                    '2024-05-10': ['10:00 -11:00', '11:00-12:00', '12:00-13:00'],
                    '2024-05-11': ['14:00-15:00', '15:00-16:00'],
                    '2024-05-12': ['16:00-17:00', '17:00-18:00', '18:00-19:00'],
                }}
            />



        </div>
    )
}
