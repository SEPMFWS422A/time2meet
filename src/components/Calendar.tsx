'use client';

import React, { useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import deLocale from "@fullcalendar/core/locales/de";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";

interface CalendarProps {
  onOpenDate: () => void;
  onOpenEvent: (info: any) => void;
}

const Calendar: React.FC<CalendarProps> = ({ onOpenDate, onOpenEvent }) => {
  const calendarRef = useRef<FullCalendar>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [isMobile, setIsMobile] = useState(false);

  // API-Aufruf für Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events", {
          method: "GET",
          credentials: "include", // Cookies mit senden
        });

        if (!response.ok) {
          if (response.status === 404) {
            console.warn("⚠️ Keine Events gefunden.");
            setEvents([]); // Statt Fehler werfen, leere Liste setzen
            return;
          }
          throw new Error("Fehler beim Abrufen der Events");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Fehler beim Abrufen der Events");
        }

        const formattedEvents = result.data.map((event: any) => ({
          id: event._id,
          title: event.title,
          start: event.start,
          end: event.allday ? undefined : event.end,
          allDay: event.allday,
          extendedProps: {
            description: event.description,
            location: event.location,
          },
        }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error("❌ Fehler beim Laden der Events:", error);
        setEvents([]); // Falls Fehler, sicherstellen, dass Events-Array nicht undefiniert bleibt
      }
    };

    fetchEvents();
  }, []);

  const changeView = (view: string) => {
    setCurrentView(view);
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(view);
    }
  };

  // Funktion, um die Fenstergröße zu überwachen
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640);
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
      id: info.event.id, // 👈 Event-ID hinzufügen
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
              right: isMobile ? "" : "dayGridMonth,timeGridThreeDay,timeGridWeek,timeGridDay,listWeek",
            }}
            height="100%"
            initialView="dayGridMonth"
            views={{
              timeGridThreeDay: {
                type: "timeGrid",
                duration: { days: 3 },
                buttonText: "3 Tage",
              },
            }}
            customButtons={{
              downloadButton: {
                text: "Events herunterladen",
                click: downloadICS,
              },
            }}
            selectable={true}
            editable={true}
            events={events}
            eventContent={renderEventContent}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            locale={deLocale}
            eventDidMount={(info) => {
              const el = info.el;
              el.style.color = "white";
              el.style.fontWeight = "normal";

              el.addEventListener("mouseover", () => {
                el.style.fontWeight = "bold";
              });

              el.addEventListener("mouseout", () => {
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
