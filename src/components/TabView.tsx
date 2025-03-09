'use client';

import {Tab, Tabs} from "@heroui/react";
import React, {useState} from "react";

interface TabViewProps {
    tabs: {
        title: string;
        content: React.ReactNode;
        icon: React.ReactNode
    }[],
    selectedTab: string
}

const TabView: React.FC<TabViewProps> = ({tabs, selectedTab}) => {

    const [selected, setSelected] = useState(selectedTab);

    return (
        <div className="rounded-lg">
            <Tabs className="flex justify-center items-center" aria-label="Options" color="primary"
                  variant="solid" selectedKey={selected}
                  onSelectionChange={(key) => setSelected(key as string)}>
                {(tabs.map((tab) => (
                    <Tab
                        key={tab.title}
                        title={
                            <div className="flex items-center gap-2">
                                {tab.icon}
                                <span>{tab.title}</span>
                            </div>
                        }
                    >
                        {tab.content}
                    </Tab>
                )))}
            </Tabs>
        </div>
    );
}

export default TabView;