"use client";

import Navbar from "@/app/components/Navbar";
import React from "react";
import MultipleChoiceSurvey from "@/app/components/MultipleChoiceSurvey";

export default function About() {

    return (

        <div>
            <Navbar />
            <div>
                <MultipleChoiceSurvey
                    options={['option1','option2','option45']}
                    name= "Meine Umfrage"
                    description = "Eine coole Umfrage" />

            </div>
        </div>
    )
}
