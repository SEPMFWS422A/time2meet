"use client";

import React from "react";
import TabView from "@/components/TabView";
import Grouplist from "@/components/Grouplist";
import {LucideUsers, PersonStandingIcon} from "lucide-react";
import Friendlist from "@/components/Friendlist";

export default function Friends() {
    return (
        <TabView selectedTab="Gruppen" tabs={[
            {title: "Gruppen", content: <Grouplist/>, icon: <LucideUsers/>},
            {title: "Freunde", content: <Friendlist/>, icon: <PersonStandingIcon/>}
        ]}/>
    );
}