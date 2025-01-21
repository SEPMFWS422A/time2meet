import React, { useState } from "react";
import { Input, Button, Checkbox, Form, } from "@heroui/react";
import { useEvents } from "@/app/lib/data/events"; 
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
      <Form className="p-4 space-y-4" validationBehavior="native">
      
      <Input
        label="Title"
        isRequired
        placeholder="Enter the event title"
        variant="bordered"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      
      <Input
        label="Description"
        isRequired
        placeholder="Enter event description"
        variant="bordered"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      
      <Input
        label="Start Time"
        isRequired
        placeholder="Select start date and time"
        variant="bordered"
        type="datetime-local" 
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
      
      {!isAllDay && (
        <>
          <Input
            label="End Time"
            isRequired
            placeholder="Select end date and time"
            variant="bordered"
            type="datetime-local" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </>
      )}
      
      <Input
        label="Location"
        isRequired
        placeholder="Enter Location"
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
           All Day Event
        </label>
      </div>
      <div className="flex justify-end space-x-4 pt-4">
          <Button color="danger" variant="light" onPress={onClose}>
            Close
          </Button>
          <Button
            color="primary"
            onPress={getFormData}
            isDisabled={!isFormValid()}  // Button deaktivieren, wenn das Formular ungültig ist
          >
            Save Event
          </Button>
        {!isFormValid() && (
          <div className="text-sm text-red-500 mt-2">
            Leere Werte!
          </div>
        )}
        </div>
    </Form>
    </div>
  );
};

export default AddEventModalContent;
