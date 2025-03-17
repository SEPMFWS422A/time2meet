import React, { useState } from 'react';
import {Button} from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";

const ParticipantSelector = ({ participants }) => {
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCheckboxChange = (participant) => {
        if (selectedParticipants.includes(participant)) {
            setSelectedParticipants(selectedParticipants.filter((p) => p !== participant));
        } else {
            setSelectedParticipants([...selectedParticipants, participant]);
        }
    };


    const handleSelect = () => {
        setIsModalOpen(false);

    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };


    return (
        <div>
            <Button
                className="h-10 text-xl bg-blue-600 text-white"
                onPress={handleOpenModal}
            >
                Teilnehmer wählen
            </Button>
            <ModalWindow
                size="3xl"
                isOpen={isModalOpen}
                onOpenChange={handleCloseModal}
                content={
                <div>
                    <ul>
                        {participants.map((participant) => (
                            <li key={participant}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={participant}
                                        checked={selectedParticipants.includes(participant)}
                                        onChange={() => handleCheckboxChange(participant)}
                                    />
                                    {participant}
                                </label>
                            </li>
                        ))}
                    </ul>
                    <button onClick={handleSelect}>Auswahl bestätigen</button>
                </div>

            }
            title={"Teilnehmer wählen"}
        ></ModalWindow>


</div>
)
    ;
};

export default ParticipantSelector;