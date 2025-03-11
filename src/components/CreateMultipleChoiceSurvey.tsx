'use client';

import React, {forwardRef, useImperativeHandle, useState} from "react";
import {Button, Form, Input} from "@heroui/react";
import {LucidePlus, Trash2} from "lucide-react";

interface CreateMultipleChoiceSurveyProps {
    onSurveyData: (data:{
        title: string;
        description: string;
        location: string;
        options: string[];
        }) => void;
}
export interface CreateMultipleChoiceSurveyRef {
    submitForm: () => void;
}

const CreateMultipleChoiceSurvey = forwardRef<CreateMultipleChoiceSurveyRef, CreateMultipleChoiceSurveyProps>(({onSurveyData}, ref) => {
    const [title, setTitle] = useState(''); 
    const [description, setDescription] = useState('');
    const [location,setLocation] = useState('');
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
                <div className="flex flex-col gap-2">
                    Optionen:
                    {inputs.map((input, index) => (
                        <div key={`${input.id}-${index}`} className="flex items-center">
                            <Input
                                isRequired
                                label="Option"
                                value={input.value}
                                onChange={(e) => handleInputChange(e, input.id)} // Korrektes ID-Binding
                                placeholder="Gib deinen Text ein"
                            />
                            <Button isIconOnly variant="light" onPress={() => handleDeleteInput(index)}>
                                <Trash2 size={20}/>
                            </Button>
                        </div>
                    ))}
                </div>

                <Button isIconOnly variant="bordered" className="" onPress={handleAddInput}><LucidePlus/></Button>
            </Form>
        </div>
    );
});

export default CreateMultipleChoiceSurvey;