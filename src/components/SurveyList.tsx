'use client';

import React, {useState} from "react";
import {Button, Card, CardBody} from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";
import SurveyParticipationModal from "@/lib/modalContents/SurveyParticipationModal";
import {EditIcon, FileQuestionIcon, TrashIcon} from "lucide-react";
import {Survey} from "@/lib/interfaces/Survey";

interface SurveyListProps {
    surveyList: Survey[],
    onDeleteSurvey?: (surveyId: string) => void,
    isCreatedByCurrentUser: boolean,
    loading: boolean,
    error: string
}

const StatusBadge = ({status}: { status: string }) => {
    const getStatusColor = () => {
        switch (status) {
            case "aktiv":
                return "bg-green-100 text-green-800";
            case "entwurf":
                return "bg-yellow-100 text-yellow-800";
            case "geschlossen":
                return "bg-gray-100 text-gray-800";
            default:
                return "bg-blue-100 text-blue-800";
        }
    };

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
            {status}
        </span>
    );
};

const SurveyList: React.FC<SurveyListProps> = ({
                                                   surveyList,
                                                   onDeleteSurvey,
                                                   isCreatedByCurrentUser,
                                                   loading,
                                                   error
                                               }) => {
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
    const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);

    const openDeleteConfirmationModal = (survey: Survey) => {
        setSurveyToDelete(survey);
        setIsDeleteConfirmationModalOpen(true);
    };

    const closeDeleteConfirmationModal = () => {
        setIsDeleteConfirmationModalOpen(false);
        setSurveyToDelete(null);
    };

    const openSurveyModal = (survey: Survey) => {
        setSelectedSurvey(survey)
        setIsSurveyModalOpen(true);
    }

    const handleDeleteSurvey = () => {
        if (surveyToDelete) {
            if (onDeleteSurvey) {
                onDeleteSurvey(surveyToDelete._id);
            } // Löscht die Umfrage über den Callback
        }
        closeDeleteConfirmationModal();
    };

    return (
        <div>
            {loading && <p id="surveyLoading">Lade Umfragen...</p>}
            {error !== "" && <p id="surveyError" className="text-red-500">Fehler: {error}</p>}
            {!loading && error === "" && surveyList.length === 0 ? (
                <p className="text-gray-500">Keine Umfragen vorhanden.</p>
            ) : (
                <div>
                    {surveyList.map((survey) => (
                        <Card
                            isPressable
                            onPress={() => openSurveyModal(survey)}
                            key={survey._id}
                            className="w-full mb-3 hover:bg-gray-50 "
                        >
                            <CardBody>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-lg">{survey.title}</h3>
                                        <p className="text-gray-600 text-sm">{survey.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <StatusBadge status={survey.status}/>
                                        <div className="flex flex-row items-end gap-1">
                                            <Button variant="bordered" isIconOnly>
                                                <FileQuestionIcon color="green" size="20"/>
                                            </Button>
                                            {isCreatedByCurrentUser && (
                                                <>
                                                    <Button variant="bordered" isIconOnly>
                                                        <EditIcon size="20"/>
                                                    </Button>
                                                    <Button onPress={() => openDeleteConfirmationModal(survey)}
                                                            variant="bordered" isIconOnly>
                                                        <TrashIcon color="red" size="20"/>
                                                    </Button>
                                                </>

                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {isDeleteConfirmationModalOpen && (
                <ModalWindow
                    isOpen={isDeleteConfirmationModalOpen}
                    onOpenChange={setIsDeleteConfirmationModalOpen}
                    title="Möchtest du diese Umfrage wirklich löschen?"
                    content={
                        <div className="flex justify-center gap-5">
                            <Button color="danger" onPress={handleDeleteSurvey}>
                                Löschen
                            </Button>
                            <Button onPress={closeDeleteConfirmationModal}>Abbrechen</Button>
                        </div>
                    }
                />
            )}

            {isSurveyModalOpen && selectedSurvey && (
                <ModalWindow
                    isOpen={isSurveyModalOpen}
                    onOpenChange={setIsSurveyModalOpen}
                    size="lg"
                    content={
                        <SurveyParticipationModal survey={selectedSurvey}/>
                    }
                />
            )}
        </div>
    );
};

export default SurveyList;
