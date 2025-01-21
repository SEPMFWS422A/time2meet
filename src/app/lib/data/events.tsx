import { createContext, useContext, useState, ReactNode } from "react";
import { EventInput } from "@fullcalendar/core";
/**
* Notiz von Chris:
* 
* Da wir momentan keine Datenbank haben, habe ich einen React Context erstellt, um unsere Mock Events zentral zu verwalten.
* React/Next.js aktualisiert die UI nicht automatisch, wenn man z.B. direkt etwas ins Event-Array einfügen würde (wie `event.push(item)`).
* 
* Der Context löst dieses Problem, indem er:
* - Die Events mit `useState` speichert und Änderungen erkennt.
* - Eine globale `addEvent`-Funktion bereitstellt, um neue Events hinzuzufügen.
* - Die UI automatisch aktualisiert, wenn sich Events ändern.
* 
* Wichtig: Dies ist nur eine temporäre Lösung, da Events beim Neuladen der Seite verloren gehen. 
* Eine Datenbank oder API sollte später hinzugefügt werden, um die Daten zu speichern .
* 
* Wenn ihr diese events verwenden wollt dann müsst ihr mit   const { events } = useEvents(); euch diese quasi vom Context hier ziehen.
* 
* In der Datei 'Calender.tsx' habe ich z.b erstmal den Import 'import { useEvents } from "../lib/data/events";' eingefügt
*  und danach die ganzen events quasi aus diesem Import rausgezogen mit der Zeile 'const { events } = useEvents();'
*   jetzt kann man die ganzen Temporären Events für diese Komponente verwenden
* 
*                                                               lol
*/

interface EventContextType {
  events: EventInput[];
  addEvent: (event: EventInput) => void;
}

// Erstelle das Context
const EventContext = createContext<EventContextType | undefined>(undefined);

// Provider für den Event Context
export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventInput[]>([
    {
      title: "event1",
      start: "2025-01-17T10:00:00",
      end: "2025-01-17T12:00:00",
      description: "event 1 description cdwbgcjkhb cwdhbcjgb cwhbjzgbcw",
      backgroundColor: "white",
      location: "Büro",
    },
    {
      title: "event2",
      start: "2025-01-20",
      allDay: true,
      description: "event 2 description",
      backgroundColor: "Blue",
      location: "Büro",
    },
    {
      title: "event3",
      start: "2025-01-22T08:00:00",
      end: "2025-01-23T18:00:00",
      description: "event 3 description",
      location: "Büro",
    },
  ]);

  // Event hinzufügen
  const addEvent = (event: EventInput) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  return (
    <EventContext.Provider value={{ events, addEvent }}>
      {children}
    </EventContext.Provider>
  );
};

// useEvents Hook, um auf die Events zuzugreifen
export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventProvider");
  }
  return context;
};



//So sah diese Datei Früher aus lol:

/*import {EventInput} from "@fullcalendar/core";

export const events: EventInput[] = [
    {
        title: "event1",
        start: "2025-01-17T10:00:00",
        end: "2025-01-17T12:00:00",
        description: "event 1 description cdwbgcjkhb cwdhbcjgb cwhbjzgbcw",
        backgroundColor: "white",
        location: "Büro",
    },
    {
        title: "event2",
        start: "2025-01-20",
        allDay: true,
        description: "event 2 description",
        backgroundColor: "Blue",
        location: "Büro",
    },
    {
        title: "event3",
        start: "2025-01-22T08:00:00",
        end: "2025-01-23T18:00:00",
        description: "event 3 description",
        location: "Büro",
    },
];*/