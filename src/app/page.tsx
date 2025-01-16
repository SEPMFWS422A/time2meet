"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import dynamic from "next/dynamic";
import { EventInput } from "@fullcalendar/core/index.js";
import Calendar from "@/app/components/Calendar";

export default function Home() {
  const downloadICS = () => {
    const link = document.createElement("a");
    link.href = "/api/event";
    link.download = "event.ics";
    link.click();
  };

  const events: EventInput[] = [
    {
      title: "event1",
      start: "2025-01-17T10:00:00",
      end: "2025-01-17T12:00:00",
      description: "event 1 description cdwbgcjkhb cwdhbcjgb cwhbjzgbcw",
      backgroundColor: "green",
    },
    {
      title: "event2",
      start: "2025-01-20",
      allDay: true,
      description: "event 2 description",
      backgroundColor: "blue",
    },
    {
      title: "event3",
      start: "2025-01-22T08:00:00",
      end: "2025-01-23T18:00:00",
      description: "event 3 description",
    },
  ];

  return (
    <div id="HomePageLayout" className="min-h-screen">
      <h1>time2meet Kalender</h1>
      <div className="ml-8 mr-8">
        <Calendar events={events} />
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
          Kalender-Eintrag herunterladen
        </button>
      </div>
    </div>
  );
}
