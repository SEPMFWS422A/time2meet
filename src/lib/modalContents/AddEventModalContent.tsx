import React, { useEffect, useState } from "react";
import { Input, Button, Checkbox, Form } from "@heroui/react";

interface AddEventModalContentProps {
  onClose: () => void;
  refreshEvents: () => void;
  existingEvent?: any; // Falls vorhanden, bedeutet das, dass wir bearbeiten
}

const AddEventModalContent: React.FC<AddEventModalContentProps> = ({ onClose, refreshEvents, existingEvent }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validierungen
  const [invalidStartDate, setInvalidStartDate] = useState(false);
  const [invalidEndDate, setInvalidEndDate] = useState(false);
  const [unreachableEndTimeError, setUnreachableEndTimeError] = useState(false);

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setDescription(existingEvent.extendedProps?.description || "");
      setStartTime(existingEvent.start);
      setEndTime(existingEvent.end || "");
      setLocation(existingEvent.extendedProps?.location || "");
      setIsAllDay(existingEvent.allDay);
    }
  }, [existingEvent]);

  const isFormValid = () => {
    if (isAllDay) {
      return title.trim() !== "" && startTime.trim() !== "";
    }
    return title.trim() !== "" && startTime.trim() !== "" && endTime.trim() !== "" && !unreachableEndTimeError;
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartTime(value);
    setInvalidStartDate(!isDateValid(value));
    checkTimeError(value, endTime);
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndTime(value);
    setInvalidEndDate(!isDateValid(value));
    checkTimeError(startTime, value);
  };

  const checkTimeError = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start).getTime();
      const endDate = new Date(end).getTime();
      setUnreachableEndTimeError(endDate <= startDate);
    }
  };

  const isDateValid = (date: string): boolean => {
    const parsedDate = new Date(date);
    return parsedDate.getFullYear() >= 1000 && parsedDate.getFullYear() <= 9999 && !isNaN(parsedDate.getTime());
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setErrorMessage("Bitte alle erforderlichen Felder ausfüllen.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const eventData = {
      id: existingEvent?.id, // Falls Bearbeitung, ID mitgeben
      creator: "65efab12cd3456789ef01234", // 👈 Hier statisch setzen, bis User-Auth existiert
      title,
      description,
      start: isAllDay ? `${startTime}T00:00:00.000Z` : startTime,
      end: isAllDay ? undefined : endTime,
      location,
      allday: isAllDay,
      members: [], // 👈 Standardwert für Mitglieder setzen
      groups: [], // 👈 Standardwert für Gruppen setzen
    };

    console.log("📩 Event-Daten, die an die API gesendet werden:", eventData);

    try {
      let response;
      if (existingEvent) {
        response = await fetch(`/api/events/${existingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || "Fehler beim Speichern.");
      }

      console.log("✅ Event erfolgreich gespeichert!");
      refreshEvents();
      onClose();
    } catch (error) {
      console.error("❌ Fehler beim Speichern:", error);
      setErrorMessage("Fehler beim Speichern.");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div>
        <Form id="addEventForm" className="p-4 space-y-3">
          <Input id="title" label="Titel" isRequired value={title} onChange={(e) => setTitle(e.target.value)} />

          <Input id="description" label="Beschreibung" value={description} onChange={(e) => setDescription(e.target.value)} />

          {isAllDay ? (
              <Input
                  label="Startdatum"
                  isRequired
                  isInvalid={invalidStartDate}
                  errorMessage="Ungültiges Startdatum"
                  placeholder="Wählen Sie das Startdatum"
                  variant="bordered"
                  type="date"
                  value={startTime}
                  onChange={handleStartTimeChange}
              />
          ) : (
              <>
                <Input
                    label="Startzeit"
                    isRequired
                    isInvalid={invalidStartDate}
                    errorMessage="Ungültige Startzeit"
                    placeholder="Wählen Sie Startdatum und -uhrzeit"
                    variant="bordered"
                    type="datetime-local"
                    value={startTime}
                    onChange={handleStartTimeChange}
                />

                <Input
                    label="Endzeit"
                    isRequired
                    isInvalid={unreachableEndTimeError || invalidEndDate}
                    errorMessage="Ungültige Endzeit"
                    placeholder="Wählen Sie Enddatum und -uhrzeit"
                    variant="bordered"
                    type="datetime-local"
                    value={endTime}
                    onChange={handleEndTimeChange}
                />
              </>
          )}

          <Input label="Ort" placeholder="Geben Sie den Ort ein" variant="bordered" value={location} onChange={(e) => setLocation(e.target.value)} />

          <div className="ml-1">
            <label>
              <Checkbox checked={isAllDay} onChange={() => setIsAllDay(!isAllDay)} />
              Ganztägiges Ereignis
            </label>
          </div>

          {errorMessage && <div id="generalFormError" className="text-red-500 text-sm">{errorMessage}</div>}

          <div className="pt-4 w-full flex justify-end space-x-4">
            <Button color="danger" variant="light" onPress={onClose} disabled={loading}>
              Schließen
            </Button>
            <Button color="primary" onPress={handleSubmit} isLoading={loading}>
              {existingEvent ? "Änderungen speichern" : "Ereignis speichern"}
            </Button>
          </div>
        </Form>
      </div>
  );
};

export default AddEventModalContent;
