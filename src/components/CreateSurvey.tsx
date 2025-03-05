import React, {useState} from "react";
import {Button} from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";
import CreateMultipleChoiceSurvey from "@/components/CreateMultipleChoiceSurvey";
import CreateScheduling from "@/components/CreateScheduling";
import {CheckIcon, CloseIcon} from "@heroui/shared-icons";
import ParticipantSelector from "@/components/ChooseParticipants";

const CreateSurvey: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const getFormData = () => {
        closeModal();
    }

    return (
        <div className="text-center text-white py-4 rounded-t-lg ">
            <Button
                className="h-10 text-xl bg-blue-600 text-white"
                onPress={handleOpenModal}>Umfrage erstellen</Button>
            <ModalWindow size="3xl" isOpen={isModalOpen} onOpenChange={handleCloseModal} content={
                <div className="top-0 relative max-h-screen gap-5 flex flex-col justify-start h-90 ">
                    <div className="top-0 relative h-90 flex flex-col md:flex-row justify-around items-center">
                        <CreateMultipleChoiceSurvey />
                        <CreateScheduling/>
                    </div>
                    <div>

                    </div>
                    <div className="flex flex-row justify-center">
                        <Button color="danger" variant="light" onPress={closeModal}>
                            <CloseIcon/>
                            Schließen
                        </Button>
                        <Button color="primary" onPress={getFormData}>
                            <CheckIcon/>
                            Abschicken
                        </Button>
                    </div>
                </div>

            } title={'Umfrage erstellen'}>
            </ModalWindow>
        </div>
    );
}

export default CreateSurvey;