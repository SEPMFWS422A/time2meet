"use client";

import React from "react";
import MultipleChoiceSurvey from "@/components/MultipleChoiceSurvey";
import CreateSurvey from "@/components/CreateSurvey";

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
        </div>
    )
}
