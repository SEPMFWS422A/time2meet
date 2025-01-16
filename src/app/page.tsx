"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

export default function Home() {
  const handleDateClick = (arg: any) => {
    console.log(arg)
    alert(arg);
  };
  const exampleEvents = [
    {
      title: "Event 1",
      start: new Date(2025,0,21).toISOString().split("T")[0],
      end: new Date(2025,0,24).toISOString().split("T")[0],
      description: "Termin beim Zahnarzt um 17:00 Uhr",
    },
    {
      title: "Event 2",
      start: "20250116T130000",
      duration: { hours: 1, minutes: 30 },
      description: "Termin beim Zahnarzt um 14:00 Uhr",
    },
  ];

  return (
    <div className="ml-8 mr-8">
      <FullCalendar height={"100vh"}
        plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin,listPlugin]}
        headerToolbar ={{left: "prev,next today", center:"title", right:"dayGridMonth,timeGridWeek,timeGridDay,listWeek"}}
        dateClick={handleDateClick}
        events={exampleEvents}
        eventContent={renderEventContent}
        initialView="dayGridMonth"
      />
    </div>
  );
}
function renderEventContent(eventInfo: any) {
  return (
    <div>
      <strong>{eventInfo.event.title}</strong>
      <p>
        {eventInfo.event.extendedProps.description}
      </p>
    </div>
  );
};

