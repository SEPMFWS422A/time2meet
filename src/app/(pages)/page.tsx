"use client";

import Calendar from "@/components/Calendar";
import {EventProvider} from "@/lib/data/events";
import React, {useState} from "react";
import ModalWindow from "@/components/ModalWindow";
import AddEventModalContent from "@/lib/modalContents/AddEventModalContent";
import EventInfoModalContent from "@/lib/modalContents/EventInfoModalContent";
import TabView from "@/components/TabView";
import Grouplist from "@/components/Grouplist";
import Friendlist from "@/components/Friendlist";
import {LucideUsers, PersonStandingIcon} from "lucide-react";


export default function Home() {

    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [isEventInfoModalOpen, setIsEventInfoModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const onOpenDate = () => {
        setIsAddEventModalOpen(true);
    };

    const onOpenEvent = (events: any) => {
        setModalData(events);
        setIsEventInfoModalOpen(true);
    };

    const closeAddEventModal = () => {
        setIsAddEventModalOpen(false);
    };

    const closeEventInfoModal = () => {
        setIsEventInfoModalOpen(false);
        setModalData(null);
    };

    const downloadICS = () => {
        const link = document.createElement("a");
        link.href = "/api/event";
        link.download = "events.ics";
        link.click();
    };

    {/* Der EventProvider tag (<EventProvider>), muss immer ganz Außen vom HTML-Baum sein, wegen dem event Context aus @/app/lib/data/events" ~Chris lol */
    }
    return (
        <EventProvider>
            <div>
                <div id="HomePageLayout" className="flex flex-col w-full">
                    <div className="ml-3 mr-3">
                        <div className="flex gap-3">
                            <div className="hidden md:flex border-1 rounded-large">
                                <TabView selectedTab="Gruppen" tabs={[
                                    {title: "Gruppen", content: <Grouplist/>, icon: <LucideUsers/>},
                                    {title: "Freunde", content: <Friendlist/>, icon: <PersonStandingIcon/>}
                                ]}/>
                            </div>
                            <Calendar onOpenDate={onOpenDate} onOpenEvent={onOpenEvent}/>
                        </div>

                        <div
                            id="DownloadDivCalendar"
                            className="mt-4 mb-4 flex items-center justify-center"
                        >
                            <button
                                id="Calendardownload"
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
                                onClick={downloadICS}
                            >
                                Alle Events als .ics herunterladen
                            </button>
                        </div>

                    </div>

                    {isAddEventModalOpen && (
                        <ModalWindow
                            isOpen={isAddEventModalOpen}
                            onOpenChange={setIsAddEventModalOpen}
                            title="Event hinzufügen"
                            content={<AddEventModalContent onClose={closeAddEventModal}/>}
                        />
                    )}

                    {isEventInfoModalOpen && modalData && (
                        <div
                            id="eventInfoModal"
                            data-is-open={isEventInfoModalOpen}
                        >
                            <ModalWindow
                                isOpen={isEventInfoModalOpen}
                                onOpenChange={setIsEventInfoModalOpen}
                                title="Event Informationen"
                                content={<EventInfoModalContent modalData={modalData} onClose={closeEventInfoModal}/>}
                            />
                        </div>
                    )}
                </div>
            </div>
        </EventProvider>
    );
}
