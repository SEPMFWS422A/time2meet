import React, { useState } from 'react';
import ModalWindow from "@/components/ModalWindow";
import {Button, Card, CardBody, CardHeader, Radio, RadioGroup} from "@heroui/react";
import {CardTitle} from "@/components/ui/card";

export default function Survey({ title, description, timeSlots }) {
    const [responses, setResponses] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false); // Modal-Zustand
    const [modalContent, setModalContent] = useState(null); // Modal-Inhalt
    const [modalTitle, setModalTitle] = useState("");   // Modal-Titel

    const handleResponse = (date, time, response) => {
        setResponses((prevResponses) => {
            const updatedResponses = { ...prevResponses };
            if (!updatedResponses[date]) {
                updatedResponses[date] = {};
            }
            if (!updatedResponses[date][time]) {
                updatedResponses[date][time] = {};
            }
            updatedResponses[date][time][user] = response;
            return updatedResponses;
        });
    };

    const user = 'Max Mustermann';

    const getResponseCount = (date, time, response) => {
        let count = 0;
        if (responses[date] && responses[date][time]) {
            for (const r in responses[date][time]) {
                if (responses[date][time][r] === response) {
                    count++;
                }
            }
        }
        return count;
    };

    const showDetails = (date, time) => {
        if (responses[date] && responses[date][time]) {
            const detailsData = responses[date][time];
            const detailsContent = (
                <ul>
                    {Object.entries(detailsData).map(([user, response]) => (
                        <li key={user}>
                            {user}: {response}
                        </li>
                    ))}
                </ul>
            );
            setModalTitle(`Details für ${date} - ${time}`);
            setModalContent(detailsContent);
            setIsModalOpen(true); // Modal öffnen
        } else {
            setModalTitle(`Details für ${date} - ${time}`);
            setModalContent(<ul><li>Keine Antworten vorhanden.</li></ul>);
            setIsModalOpen(true); // Modal öffnen (mit leerer Meldung)
        }
    };

    const dates = Object.keys(timeSlots);

    return (
        <div className="flex flex-col items-center justify-center">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center bg-blue-600 text-white py-4 rounded-t-lg">
                    <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardBody className="p-6 bg-white">
                    <p className="relative text-foreground-500 text-xl pb-4">{description}</p>
                    {dates.map((date) => (
                        <div key={date}>
                            <h3 className=" bg-blue-600 text-white text-xl font-bold text-center ">{date}</h3>
                            <ul>
                                {timeSlots[date].map((time) => (
                                    <li key={time}>
                                       <p className="text-l font-bold" >{time}</p>
                                        <label className={"px-4"}>
                                            <input

                                                type="radio"
                                                name={`${date}-${time}`}
                                                value="ja"
                                                onChange={() => handleResponse(date, time, 'ja')}
                                            />
                                            Ja ({getResponseCount(date, time, 'ja')})
                                        </label>
                                        <label className={"px-4"}>
                                            <input
                                                type="radio"
                                                name={`${date}-${time}`}
                                                value="nein"
                                                onChange={() => handleResponse(date, time, 'nein')}
                                            />
                                            Nein ({getResponseCount(date, time, 'nein')})
                                        </label>
                                        <label className={"px-4"}>
                                            <input
                                                type="radio"
                                                name={`${date}-${time}`}
                                                value="vielleicht"
                                                onChange={() => handleResponse(date, time, 'vielleicht')}
                                            />
                                            Vielleicht ({getResponseCount(date, time, 'vielleicht')})
                                        </label>
                                        <Button onClick={() => showDetails(date, time)}>
                                            Ergebnis zeigen
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}


                </CardBody>
            </Card>




            <ModalWindow
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen} // Wichtig für das Schließen
                content={modalContent}
                title={modalTitle}
            />
        </div>
    );
}