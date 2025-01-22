import React, { useState } from "react";
import { Input, Button, Checkbox, Form, } from "@heroui/react";
import { useEvents } from "@/lib/data/events";
import { EventInput } from "@fullcalendar/core";


interface AddEventModalContentProps{
  onClose:() => void;
}


const AddEventModalContent: React.FC<AddEventModalContentProps> = ({ onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);

  const { addEvent } = useEvents(); 

  // Validierungsfunktion
  const isFormValid = () => {
    return (
      title.trim() !== "" &&
      description.trim() !== "" &&
      (isAllDay || (startTime.trim() !== "" && endTime.trim() !== "")) &&
      location.trim() !== ""
    );
  };

  const getFormData =() => {

    if (!isFormValid()) {
      return; // Verhindert das Absenden, wenn das Formular leer ist lol
    }

    const eventInput: EventInput = {
      title: title,
      description: description,
      start: startTime,
      allDay: isAllDay, 
      location: location,
    };
    if (!isAllDay) {
      eventInput.end = endTime; 
    }
    if (isAllDay) {
      eventInput.backgroundColor="Blue";
    }
   addEvent(eventInput); 
   onClose();
  };

  return (
    <div>
      <Form id="addEventForm" className="p-4 space-y-4" validationBehavior="native">
        <Input
          label="Titel"
          isRequired
          placeholder="Geben Sie den Titel des Ereignisses ein"
          variant="bordered"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="Beschreibung"
          isRequired
          placeholder="Geben Sie die Beschreibung des Ereignisses ein"
          variant="bordered"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Input
          label="Startzeit"
          isRequired
          placeholder="Wählen Sie Startdatum und -uhrzeit"
          variant="bordered"
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />

        {!isAllDay && (
          <>
            <Input
              label="Endzeit"
              isRequired
              placeholder="Wählen Sie Enddatum und -uhrzeit"
              variant="bordered"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </>
        )}

        <Input
          label="Ort"
          isRequired
          placeholder="Geben Sie den Ort ein"
          variant="bordered"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div>
          <label>
            <Checkbox
              type="checkbox"
              checked={isAllDay}
              onChange={() => setIsAllDay(!isAllDay)}
            />
            Ganztägiges Ereignis
          </label>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button color="danger" variant="light" onPress={onClose}>
            Schließen
          </Button>
          <Button
            color="primary"
            onPress={getFormData}
            isDisabled={!isFormValid()} // Button deaktivieren, wenn das Formular ungültig ist
          >
            Ereignis speichern
          </Button>
          {!isFormValid() && (
            <div className="text-sm text-red-500 mt-2">
              Bitte alle Felder ausfüllen!
            </div>
          )}
        </div>
      </Form>
    </div>
  );
};

export default AddEventModalContent;
