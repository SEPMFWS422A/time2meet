import React, {useState} from "react";
import {Button, Form, Input} from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";
import {DeleteIcon} from "@heroui/shared-icons";


export default function CreateSurvey() {
    const [inputs, setInputs] = useState([{id: Date.now(), value: ''}]);

    const handleInputChange = (e, id) => {
        setInputs(
            inputs.map((input) =>
                input.id === id ? {...input, value: e.target.value} : input
            )
        );
    };

    const handleAddInput = () => {
        setInputs([...inputs, {id: Date.now(), value: ''}]);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const values = inputs.map((input) => input.value);
        console.log(values); // Array mit allen eingegebenen Werten
    }
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };
    const handleDeleteInput = (index) => {
        if (inputs.length > 1) { // Prevent deleting the last input
            setInputs(inputs.filter((_, i) => i !== index));
        }
    };

    return (

        <div className="text-center text-white py-4 rounded-t-lg ">
            <Button
                className="h-10 text-xl bg-blue-600 text-white"
                onPress={handleOpenModal}>Umfrage erstellen</Button>
            <ModalWindow isOpen={isModalOpen} onOpenChange={handleCloseModal} content={
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
                    <div>
                        Optionen:
                        {inputs.map((input, index) => (
                            <div className="flex items-center">
                                <Input
                                    className="flex-1 mr-2"
                                    isRequired
                                    label="Option"
                                    key={input.id}
                                    value={input.value}
                                    onChange={(e) => handleInputChange(e, input.id)}
                                    placeholder="Gib deinen Text ein"
                                />
                                <Button className="mr-2"
                                        onPress={() => handleDeleteInput(index)}><DeleteIcon/></Button>
                            </div>


                        ))}

                    </div>
                    <Button onPress={handleAddInput}>Option hinzufügen</Button>

                    <Button className="bg-blue-600 text-white py-4"
                            type="submit">Absenden
                    </Button>
                </Form>

            } title={'Umfrage erstellen'}>

            </ModalWindow>

        </div>

    );
}