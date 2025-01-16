"use client"
import {Calendar} from "@nextui-org/react";
import {parseDate} from "@internationalized/date";

export default function DownloadICS() {
    const downloadICS = () => {
        const link = document.createElement("a");
        link.href = "/api/event";
        link.download = "event.ics";
        link.click();
    };

  return (
    <div  id="HomePageLayout"  className="grid grid-rows-[] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Calendar id="e2eCalendar" aria-label="Date (Uncontrolled)" defaultValue={parseDate(new Date().toISOString().split('T')[0])} />

      <div id="DownloadDivCalendar">
        <button id="Calendardownload" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full" onClick={downloadICS}>Kalender-Eintrag herunterladen</button>
      </div>
    </div>
  );
}
