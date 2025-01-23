import React, { useState } from "react";
import { Input, Button, Checkbox, Form, } from "@heroui/react";
import { useEvents } from "@/lib/data/events";
import { EventInput } from "@fullcalendar/core";


interface AddEventModalContentProps{
  onClose:() => void;
}


const AddEventModalContent: React.FC<AddEventModalContentProps> = ({ onClose }) => {
  //Input-Felder
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isAllDay, setIsAllDay] = useState(false);

  //Errors
  const [unreachableEndTimeError, setUnreachableEndTimeError] = useState<boolean>(false);
  const [invalidStartDate,setStartDateError] = useState<boolean>(false);
  const [invalidEndDate,setEndDateError] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  const { addEvent } = useEvents(); 

  const isFormValid = () => {
    if (isAllDay) {
      return title.trim() !== "" && startTime.trim() !== "";
    }

    if (unreachableEndTimeError||invalidEndDate||invalidStartDate) {
      return;
    }
    return (
      title.trim() !== "" &&
      startTime.trim() !== "" &&
      endTime.trim() !== ""
    );
  };
  
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartTime(value);
    setStartDateError(!isDateValid(value));
    checkTimeError(value, endTime);
  };
  
  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndTime(value);
    setEndDateError(!isDateValid(value))
    checkTimeError(startTime, value);
  };
  
  const checkTimeError = (start: string, end: string) => {
    if (start && end) {
      const startDate = new Date(start).getTime();
      const endDate = new Date(end).getTime();
      if (endDate <= startDate) {
        setUnreachableEndTimeError(true);
      } else {
        setUnreachableEndTimeError(false);
      }
    }
  };

  const isDateValid = (date: string):boolean => {
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();

    // Ist das Datum 4 Stellig und Valide
    var result = year >= 1000 && year <= 9999 && !isNaN(parsedDate.getTime());
    return result
  };
  
  const toggleAllDay = () => {
    setIsAllDay(!isAllDay);

    if (!isAllDay) {
      setStartTime((prev) => prev.split("T")[0]); 
      setEndTime("");
    } else {
      setStartTime((prev) => (prev ? `${prev}T00:00` : ""));
    }
  };

  const getFormData =() => {

    if (!isFormValid()) {
      setShowError(true);
      return; 
    }
    setShowError(false);

    const eventInput: EventInput = {
      title: title,
      description: description,
      start: startTime,
      ...(isAllDay ? { allDay: true } : { end: endTime }),
      location: location,
    };
    if (isAllDay) {
      eventInput.backgroundColor="Blue";
    }
   addEvent(eventInput); 
   onClose();
  };

  return (
    <div>
      <Form
        id="addEventForm"
        className="p-4 space-y-3"
        validationBehavior="native"
      >
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
          placeholder="Geben Sie die Beschreibung des Ereignisses ein"
          variant="bordered"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {isAllDay ? (
          <Input
            label="Startdatum"
            isRequired
            isInvalid={invalidStartDate}
            errorMessage="Ungültige Startzeit"
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
              isInvalid={unreachableEndTimeError||invalidEndDate}
              errorMessage="Ungültige Endzeit"
              placeholder="Wählen Sie Enddatum und -uhrzeit"
              variant="bordered"
              type="datetime-local"
              value={endTime}
              onChange={handleEndTimeChange}
            />
          </>
        )}

        <Input
          label="Ort"
          placeholder="Geben Sie den Ort ein"
          variant="bordered"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="ml-1">
          <label>
            <Checkbox
              type="checkbox"
              checked={isAllDay}
              onChange={toggleAllDay}
            />
            Ganztägiges Ereignis
          </label>
        </div>

        <div className="pt-4 w-full">


          <div className="flex justify-end space-x-6 gap-2 items-center">
          {showError && (
            <div id="generalFormError" className="text-sm text-danger">
              Überprüfen Sie Ihre Eingaben
            </div>
          )}

            <Button color="danger" variant="light" onPress={onClose}>
              Schließen
            </Button>
            <Button color="primary" onPress={getFormData}>
              Ereignis speichern
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
};

export default AddEventModalContent;
