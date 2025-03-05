import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { useEvents } from "@/lib/data/events";
import deLocale from "@fullcalendar/core/locales/de";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";

interface CalendarProps {
  onOpenDate: () => void;
  onOpenEvent: (info: any) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onOpenDate, onOpenEvent }) => {
  const calendarRef = useRef<FullCalendar>(null);

  //events aus dem eventsContext rausziehen ~Chris
  const { events } = useEvents();

  const [currentView, setCurrentView] = useState("dayGridMonth");

  const changeView = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  const [isMobile, setIsMobile] = useState(false);

  // Funktion, um die Fenstergröße zu überwachen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // 640px = Tailwind `sm`
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleDateClick = () => {
    onOpenDate();
  };

  const handleEventClick = (info: any) => {
    onOpenEvent({
      title: info.event.title,
      start: info.event.start?.toISOString(),
      end: info.event.end?.toISOString(),
      allDay: info.event.allDay,
      extendedProps: {
        description: info.event.extendedProps.description,
        location: info.event.extendedProps.location,
      },
    });
  };

  const downloadICS = () => {
    const link = document.createElement("a");
    link.href = "/api/event";
    link.download = "events.ics";
    link.click();
  };

  return (
    <div className="w-full h-[80vh] overflow-auto">
      {/* Custom Dropdown */}
      {/* Mobile Ansicht: Dropdown wird nur angezeigt, wenn `isMobile` true ist */}
      {isMobile && (
        <div className="flex justify-between">
          <Button variant="bordered" onPress={downloadICS}>
            Events herunterladen
          </Button>
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered">Ansicht wählen</Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Ansicht wählen">
              {[
                { key: "dayGridMonth", label: "Monat" },
                { key: "timeGridThreeDay", label: "3 Tage" },
                { key: "timeGridWeek", label: "Woche" },
                { key: "timeGridDay", label: "Tag" },
                { key: "listWeek", label: "Liste" },
              ].map(({ key, label }) => (
                <DropdownItem key={key} onPress={() => changeView(key)}>
                  {label}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        headerToolbar={{
          left: isMobile ? "prev,next today" : "prev,next today downloadButton",
          center: "title",
          right: isMobile ? "" : "dayGridMonth,timeGridThreeDay,timeGridWeek,timeGridDay,listWeek"
        }}
        height="100%"
        initialView="dayGridMonth"
        views={{
          timeGridThreeDay: {
            type: "timeGrid",
            duration: { days: 3 },
            buttonText: "3 Tage"
          }
        }}
        customButtons={{
          downloadButton: {
            text: "Events herunterladen",
            click: downloadICS
          }
        }}
        selectable={true}
        editable={true}
        events={events} //Hier habe ich die Events aus dem EventsContext gezogen und eingefügt ~Chris
        eventContent={renderEventContent}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        //eventColor="green"
        locale={deLocale}
        eventDidMount={(info) => {
          const el = info.el;
          if (info.event.allDay) {
            el.style.backgroundColor = "blue";
            el.style.borderColor = "blue";
          } else {
            el.style.backgroundColor = "magenta";
            el.style.borderColor = "magenta";
          }
          el.style.color = "white";
          el.style.fontWeight = "normal";

          el.addEventListener("mouseover", () => {
            if (info.event.allDay) {
              el.style.backgroundColor = "darkblue";
              el.style.borderColor = "darkblue";
            } else {
              el.style.backgroundColor = "darkmagenta";
              el.style.borderColor = "darkmagenta";
            }
            el.style.fontWeight = "bold";
          });

          el.addEventListener("mouseout", () => {
            if (info.event.allDay) {
              el.style.backgroundColor = "blue";
              el.style.borderColor = "blue";
            } else {
              el.style.backgroundColor = "magenta";
              el.style.borderColor = "magenta";
            }
            el.style.fontWeight = "normal";
          });
        }}
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
