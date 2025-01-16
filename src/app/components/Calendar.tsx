import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import { EventInput } from "@fullcalendar/core/index.js";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";

interface CalendarProps {
  events: EventInput[];
}

const Calendar: React.FC<CalendarProps> = ({ events }) => {
  const calendarRef = useRef<FullCalendar>(null);

  //Handler für Date-klick
  const handleDateClick = (info: any) => {
    alert("Datum geklickt: ${info.dateStr}");
  };

  // Handle für Event-Klick
  const handleEventClick = (info: any) => {
    alert("Event geklickt: ${info.event.title}");
  };

  return (
    <div>
      <FullCalendar
        ref={calendarRef}
        height={"100vh"}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        initialView="dayGridMonth"
        selectable={true}
        editable={true}
        events={events}
        eventContent={renderEventContent}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventColor="green"
      />
    </div>
  );
};

function renderEventContent(eventInfo: any) {
  return (
    <div>
      <strong>{eventInfo.event.title}</strong>
      <p>{eventInfo.event.extendedProps.description}</p>
    </div>
  );
}

export default Calendar;
