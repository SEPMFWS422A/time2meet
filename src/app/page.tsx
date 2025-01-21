"use client";

import Calendar from "@/app/components/Calendar";
import { EventProvider } from "@/app/lib/data/events";
import Navbar from "@/app/components/Navbar";
import React, { useState } from "react";
import ModalWindow from "./components/ModalWindow";
import  AddEventModalContent  from "./lib/modalContents/AddEventModalContent";

export default function Home() {

  const [isModalOpen, setModalOpen] = useState(false);

  const onOpenDate = () => {
    setModalOpen(true);
  };
  const onOpenEvent=()=>{

  }

  const closeModal = () =>{
    setModalOpen(false);
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
            Alle Events Herunterladen
          </button>
        </div>
        {isModalOpen && (
          <ModalWindow
            isOpen={isModalOpen}
            onOpenChange={setModalOpen}
            title="Event hinzufügen"
            content= {<AddEventModalContent onClose={closeModal}/>}
            ></ModalWindow>
        )}
      </div>
    </div>
  </EventProvider>
  );
}
