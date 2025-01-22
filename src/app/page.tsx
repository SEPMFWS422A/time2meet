"use client";

import Calendar from "@/components/Calendar";
import {EventProvider, useEvents} from "@/lib/data/events";
import Navbar from "@/components/Navbar";
import React, { useState } from "react";
import ModalWindow from "@/components/ModalWindow";
import  AddEventModalContent  from "@/lib/modalContents/AddEventModalContent";
import EventInfoModalContent from "@/lib/modalContents/EventInfoModalContent";

export default function Home() {

  const [isAddEventModalOpen, setAddEventModalOpen] = useState(false);
  const [isEventInfoModalOpen, setEventInfoModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);

  const onOpenDate = () => {
    setAddEventModalOpen(true);
  };

  const onOpenEvent = (events: any) => {
    setModalData(events);
    setEventInfoModalOpen(true);
  };

  const closeAddEventModal = () => {
    setAddEventModalOpen(false);
  };

  const closeEventInfoModal = () => {
    setEventInfoModalOpen(false);
    setModalData(null);
  };

  const downloadICS = () => {
    const link = document.createElement("a");
    link.href = "/api/event";
    link.download = "events.ics";
    link.click();
  };

  {/* Der EventProvider tag (<EventProvider>), muss immer ganz Außen vom HTML-Baum sein, wegen dem event Context aus @/app/lib/data/events" ~Chris lol */}
  return (
  <EventProvider>
    <div>
      <Navbar />
      <div id="HomePageLayout" className="min-h-screen pt-20">
        <div className="ml-8 mr-8">
          <Calendar onOpenDate={onOpenDate} onOpenEvent={onOpenEvent} />
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
        {isAddEventModalOpen && (
            <ModalWindow
                isOpen={isAddEventModalOpen}
                onOpenChange={setAddEventModalOpen}
                title="Event hinzufügen"
                content={<AddEventModalContent onClose={closeAddEventModal} />}
            />
        )}

        {isEventInfoModalOpen && modalData && (
            <div
            id="eventInfoModal"
            data-is-open={isEventInfoModalOpen}
            >
              <ModalWindow
                isOpen={isEventInfoModalOpen}
                onOpenChange={setEventInfoModalOpen}
                title="Event Informationen"
                content={<EventInfoModalContent modalData={modalData} onClose={closeEventInfoModal} />}
              />
            </div>
        )}
      </div>
    </div>
  </EventProvider>
  );
}
