'use client';

import React, {forwardRef, useImperativeHandle, useState} from "react";
import {Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Form, Input,Selection} from "@heroui/react";
import {LucidePlus, Trash2} from "lucide-react";

interface CreateMultipleChoiceSurveyProps {
    onSurveyData: (data:{
        title: string;
        description: string;
        location: string;
        options: string[];
        status: string; 
        participants: string[] | undefined; // Später muss man serverseitig die Strings von den Participants in ObjectIds umwandeln
        }) => void;
}
export interface CreateMultipleChoiceSurveyRef {
    submitForm: () => void;
}

const CreateMultipleChoiceSurvey = forwardRef<CreateMultipleChoiceSurveyRef, CreateMultipleChoiceSurveyProps>(({onSurveyData}, ref) => {
    const [title, setTitle] = useState(''); 
    const [description, setDescription] = useState('');
    const [location,setLocation] = useState('');
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set(["entwurf"]));
    const [participants, setParticipants] = useState<string[] | undefined>(undefined); //Für das Spätere einbauen
    const [inputs, setInputs] = useState([{id: Date.now(), value: ''}]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDescription(e.target.value);
    };
    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocation(e.target.value);
    };
    const selectedValue = React.useMemo(
        () => Array.from(selectedKeys).join(", ").replace(/_/g, ""),
        [selectedKeys],
    );
    
    
    const handleInputChange = (e: any, id: any) => {
        setInputs(
            inputs.map((input) =>
                input.id === id ? {...input, value: e.target.value} : input
            )
        );
    };

    const handleAddInput = () => {
        setInputs([...inputs, {id: Date.now(), value: ''}]);
    };


    const handleSubmit = () => {
        const values = inputs.map((input) => input.value); 
        const formData = {
            title, 
            description,
            location, 
            options: values,
            status: selectedValue,  
            participants, 
        };
        onSurveyData(formData); // Sende die Daten an die Parent-Komponente
    };

    const handleDeleteInput = (index: any) => {
        if (inputs.length > 1) { 
            setInputs(inputs.filter((_, i) => i !== index));
        }
    };

    useImperativeHandle(ref, () => ({
        submitForm: handleSubmit
    }));

    return (
      <div className="w-full md:w-6/12">
        <Form>
          <Input
            isRequired
            label="Titel"
            labelPlacement="outside"
            name="Titel"
            placeholder="Titel der Umfrage angeben"
            type="title"
            value={title}
            onChange={handleTitleChange}
          />
          <Input
            label="Beschreibung"
            labelPlacement="outside"
            name="description"
            placeholder="Beschreibung angeben"
            type="descr"
            value={description}
            onChange={handleDescriptionChange}
          />
          <Input
            label="Ort"
            labelPlacement="outside"
            name="Ort"
            placeholder="Ort angeben"
            type="location"
            value={location}
            onChange={handleLocationChange}
          />
          <Dropdown>
            <DropdownTrigger>
              <Button variant="bordered" color={"primary"} className="mt-4">
                Status: {selectedValue}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Status auswählen"
              selectedKeys={selectedKeys}
              selectionMode="single"
              variant="flat"
              onSelectionChange={setSelectedKeys}
            >
              <DropdownItem key="entwurf">Entwurf</DropdownItem>
              <DropdownItem key="aktiv">Aktiv</DropdownItem>
              <DropdownItem key="geschlossen">Geschlossen</DropdownItem>
            </DropdownMenu>
          </Dropdown>

          <div className="flex flex-col gap-2">
            Optionen:
            {inputs.map((input, index) => (
              <div key={`${input.id}-${index}`} className="flex items-center">
                <Input
                    aria-label="Option"
                  isRequired
                  label="Option"
                  value={input.value}
                  onChange={(e) => handleInputChange(e, input.id)} // Korrektes ID-Binding
                  placeholder="Gib deinen Text ein"
                />
                <Button
                  isIconOnly
                  variant="light"
                  onPress={() => handleDeleteInput(index)}
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            ))}
          </div>

          <Button
              aria-label="Option hinzufügen"
            isIconOnly
            variant="bordered"
            className=""
            onPress={handleAddInput}
          >
            <LucidePlus />
          </Button>
        </Form>
      </div>
    );
});

export default CreateMultipleChoiceSurvey;