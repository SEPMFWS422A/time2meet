import React, {useState} from "react";
import {Button} from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";
import TabView from "@/components/TabView";
import CreateMultipleChoiceSurvey from "@/components/CreateMultipleChoiceSurvey";
import CreateScheduling from "@/components/CreateScheduling";
import {CalendarCheck, LucideNotepadText} from "lucide-react";

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

    return (
        <div className="text-center text-white py-4 rounded-t-lg ">
            <Button
                className="h-10 text-xl bg-blue-600 text-white"
                onPress={handleOpenModal}>Umfrage erstellen</Button>
            <ModalWindow isOpen={isModalOpen} onOpenChange={handleCloseModal} content={
                <div className="flex justify-center items-center">
                    <TabView tabs={[
                        {
                            title: "Umfrage",
                            content: <CreateMultipleChoiceSurvey onClose={closeModal}/>,
                            icon: <LucideNotepadText/>
                        },
                        {
                            title: "Terminfindung",
                            content: <CreateScheduling onClose={closeModal}/>,
                            icon: <CalendarCheck/>
                        }
                    ]} selectedTab={"Umfrage"}>
                    </TabView>
                </div>

            } title={'Umfrage erstellen'}>
            </ModalWindow>
        </div>
    );
}

export default CreateSurvey;