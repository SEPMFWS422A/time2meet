import React, {useState} from "react";
import {Form, Input, Button, Card, CardBody, CardHeader,} from "@heroui/react";
import {CardTitle} from "@/components/ui/card";

export default function CreateSurvey() {
        const [inputs, setInputs] = useState([{ id: Date.now(), value: '' }]);

        const handleInputChange = (e, id) => {
            setInputs(
                inputs.map((input) =>
                    input.id === id ? { ...input, value: e.target.value } : input
                )
            );
        };

        const handleAddInput = () => {
            setInputs([...inputs, { id: Date.now(), value: '' }]);
        };

        const handleSubmit = (e) => {
            e.preventDefault();
            const values = inputs.map((input) => input.value);
            console.log(values); // Array mit allen eingegebenen Werten
        };

        return (
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center bg-blue-600 text-white py-4 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold"> Umfrage erstellen </CardTitle>
                </CardHeader>
                <CardBody className="p-6 bg-white">
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
                            {inputs.map((input) => (
                                <Input
                                    isRequired
                                    key={input.id}
                                    value={input.value}
                                    onChange={(e) => handleInputChange(e, input.id)}
                                    placeholder="Gib deinen Text ein"
                                />
                            ))}
                            <Button onClick={handleAddInput}>Option hinzufügen</Button>
                        </div>
                        <Button type="submit">Absenden</Button>
                    </Form>
                </CardBody>
            </Card>
        );
    }