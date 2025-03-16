'use client';

import React, {useState} from "react";
import {Button, Listbox, ListboxItem, ListboxSection} from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";
import SurveyParticipationModal from "@/lib/modalContents/SurveyParticipationModal";
import {EditIcon, FileQuestionIcon, TrashIcon} from "lucide-react";
import {ISurvey} from "@/lib/interfaces/ISurvey";

interface SurveyListProps {
    surveyList: ISurvey[],
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
    const [selectedSurvey, setSelectedSurvey] = useState<ISurvey | null>(null);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [isDeleteConfirmationModalOpen, setIsDeleteConfirmationModalOpen] = useState(false);
    const [surveyToDelete, setSurveyToDelete] = useState<ISurvey | null>(null);

    const openDeleteConfirmationModal = (survey: ISurvey) => {
        setSurveyToDelete(survey);
        setIsDeleteConfirmationModalOpen(true);
    };

    const closeDeleteConfirmationModal = () => {
        setIsDeleteConfirmationModalOpen(false);
        setSurveyToDelete(null);
    };

    const openSurveyModal = (survey: ISurvey) => {
        setSelectedSurvey(survey)
        setIsSurveyModalOpen(true);
    }

    const handleDeleteSurvey = () => {
        if (surveyToDelete) {
            if (onDeleteSurvey) {
                onDeleteSurvey(surveyToDelete._id);
            }
        }
        closeDeleteConfirmationModal();
    };

    return (
        <div>
            {loading && <p id="surveyLoading">Lade Umfragen...</p>}
            {error !== "" && <p id="surveyError" className="text-center">{error}</p>}
            {!loading && error === "" && surveyList.length === 0 ? (
                <p className="text-gray-500">Keine Umfragen vorhanden.</p>
            ) : (
                <Listbox
                    id="surveyList"
                    aria-label="Surveys"
                    items={surveyList}
                >
                    <ListboxSection>
                        {surveyList.map((survey) => (
                            <ListboxItem
                                variant="faded"
                                onPress={() => openSurveyModal(survey)}
                                key={survey._id}
                                textValue={survey.title}
                            >
                                <div id="surveyListItem" className="flex gap-2 justify-between items-center">
                                    <div>
                                        <h3 id="surveyTitle" className="font-semibold text-lg">{survey.title}</h3>
                                        <p id="surveyDescription"
                                           className="text-gray-600 text-sm">{survey.description}</p>
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
                                                    <Button id="deleteSurveyButton"
                                                            onPress={() => openDeleteConfirmationModal(survey)}
                                                            variant="bordered" isIconOnly>
                                                        <TrashIcon color="red" size="20"/>
                                                    </Button>
                                                </>

                                            )}
                                        </div>
                                    </div>
                                </div>
                            </ListboxItem>
                        ))}
                    </ListboxSection>
                </Listbox>
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
