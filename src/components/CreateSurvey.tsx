'use client';

import React, {useRef, useState, useEffect} from "react";
import {Button} from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";
import CreateMultipleChoiceSurvey, {CreateMultipleChoiceSurveyRef} from "@/components/CreateMultipleChoiceSurvey";
import CreateScheduling, {CreateSchedulingRef} from "@/components/CreateScheduling";
import {CheckIcon, CloseIcon} from "@heroui/shared-icons";
import { CalendarDateTime, Time, ZonedDateTime } from "@internationalized/date";
import { MappedTimeValue, TimeValue } from "@react-types/datepicker";


const CreateSurvey: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [surveyData, setSurveyData] = useState<{
        title: string;
        description: string;
        location: string;
        options: string[];
    } | null>(null);

    const [schedulingData, setSchedulingData] = useState<{
        dates: { date: Date; times: { start: TimeValue | null | undefined; end: TimeValue | null | undefined }[] }[]
    } | null>(null);

    const MultipleChoiceSurveyRef = useRef<CreateMultipleChoiceSurveyRef>(null);
    const SchedulingSurveyRef = useRef<CreateSchedulingRef>(null);


    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };
    const handleSurveyData = (data: {
        title: string;
        description: string;
        location: string;
        options: string[];
    }) => {
        setSurveyData(data);
    };

    const handleSchedulingData = (data: {
        dates: { date: Date; times: { start: TimeValue | null | undefined; end: TimeValue | null | undefined }[] }[]
    }) => {
        setSchedulingData(data);
    };

    useEffect(() => {
        if (surveyData) {
            console.log("SurveyData von der ParentKomponente (useEffect): ", surveyData);
        }
        if (schedulingData) {
            console.log("SchedulingData von der ParentKomponente (useEffect): ", schedulingData);
        }
    }, [surveyData, schedulingData]); 

    const getFormData = () => {
        if (MultipleChoiceSurveyRef.current) {
            MultipleChoiceSurveyRef.current.submitForm();
        }
        if (SchedulingSurveyRef.current) {
            SchedulingSurveyRef.current.submitForm();
        }
        closeModal();
    };

    return (
        <div id="createSurveyButton" className="text-center text-white py-4 rounded-t-lg ">
            <Button
                className="h-10 text-xl bg-blue-600 text-white"
                onPress={handleOpenModal}>Umfrage erstellen</Button>
            <ModalWindow size="3xl" isOpen={isModalOpen} onOpenChange={handleCloseModal} content={
                <div className="top-0 relative max-h-screen gap-5 flex flex-col justify-start h-90 ">
                    <div className="top-0 relative h-90 flex flex-col md:flex-row justify-around items-center">
                        <CreateMultipleChoiceSurvey ref={MultipleChoiceSurveyRef} onSurveyData={handleSurveyData} />
                        <CreateScheduling ref={SchedulingSurveyRef} onSchedulingData={handleSchedulingData}/>
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