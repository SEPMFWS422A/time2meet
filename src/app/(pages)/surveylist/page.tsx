"use client";

import React from "react";
import MultipleChoiceSurvey from "@/components/MultipleChoiceSurvey";

export default function About() {

    return (

        <div>
            <div>
                <MultipleChoiceSurvey
                    options={['option1', 'option2', 'option45']}
                    name="Meine Umfrage"
                    description="Eine coole Umfrage"/>

            </div>
        </div>
    )
}
