'use client';

import React, {useState} from "react";
import {Button, Form, Input} from "@heroui/react";
import {LucidePlus, Trash2} from "lucide-react";

const CreateMultipleChoiceSurvey: React.FC = () => {

    const [inputs, setInputs] = useState([{id: Date.now(), value: ''}]);

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


    const handleSubmit = (e: any) => {
        e.preventDefault();
        const values = inputs.map((input) => input.value);
        console.log(values); // Array mit allen eingegebenen Werten
    }

    const handleDeleteInput = (index: any) => {
        if (inputs.length > 1) { // Prevent deleting the last input
            setInputs(inputs.filter((_, i) => i !== index));
        }
    };

    return (
        <div className="w-full md:w-6/12">
            <Form onSubmit={handleSubmit}>
                <Input
                    isRequired
                    label="Titel"
                    labelPlacement="outside"
                    name="Titel"
                    placeholder="Titel der Umfrage angeben"
                    type="title"
                />
                <Input
                    label="Beschreibung"
                    labelPlacement="outside"
                    name="description"
                    placeholder="Beschreibung angeben"
                    type="descr"
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
}

export default CreateMultipleChoiceSurvey;