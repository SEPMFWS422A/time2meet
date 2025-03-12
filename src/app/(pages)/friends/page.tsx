import React from "react";
import TabView from "@/components/TabView";
import {LucideUsers, PersonStandingIcon} from "lucide-react";
import Friendlist from "@/components/Friendlist";
import Grouplist from "@/components/Grouplist";

export default function Friends() {
    return (
        <TabView selectedTab="Gruppen" tabs={[
            {title: "Gruppen", content: <Grouplist/>, icon: <LucideUsers/>},
            {title: "Freunde", content: <Friendlist/>, icon: <PersonStandingIcon/>}
        ]}/>
    );
}