"use client";

import Calendar from "@/app/components/Calendar";
import  { events} from "@/app/lib/data/events";

export default function Home() {
  const downloadICS = () => {
    const link = document.createElement("a");
    link.href = "/api/event";
    link.download = "events.ics";
    link.click();
  };

  return (
    <div id="HomePageLayout" className="min-h-screen">
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
          Alle Events Herunterladen
        </button>
      </div>
    </div>
  );
}
