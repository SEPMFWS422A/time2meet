"use client";

import React from "react";
import SurveyTab from "@/components/SurveyTab";

export default function About() {

    return (
        <div>
            <SurveyTab></SurveyTab>
        </div>

        // <div>
        //     <div>
        //
        //         <CreateSurvey/>
        //         <MultipleChoiceSurvey
        //             options={['option1', 'option2', 'option45']}
        //             title="Meine Umfrage"
        //             description="Eine coole Umfrage"/>
        //     </div>
        //     <DateSurvey
        //         title="Terminfindung für das nächste Teammeeting"
        //         description="Bitte geben Sie Ihre Präferenzen für die folgenden Termine an."
        //         schedule={[
        //             {
        //                 date: '2024-05-10',
        //                 timeSlots: ['10:00-11:00', '11:00-12:00', '12:00-13:00']
        //             },
        //             {
        //                 date: '2024-05-11',
        //                 timeSlots: ['14:00-15:00', '15:00-16:00']
        //             },
        //             {
        //                 date: '2024-05-12',
        //                 timeSlots: ['16:00-17:00', '17:00-18:00', '18:00-19:00']
        //             }
        //         ]}
        //     />
        // </div>
    )
}
