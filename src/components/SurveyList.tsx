import React, {useState} from "react";
import {Card, CardBody} from "@heroui/react";
import ModalWindow from "@/components/ModalWindow";
import MultipleChoiceSurvey from "@/components/MultipleChoiceSurvey";

interface DaySchedule {
    date: string;
    timeSlots: string[];
}

interface Survey {
    title: string;
    description: string;
    options?: string[]; // Optional für Aktivitätsumfrage
    schedule?: DaySchedule[]; // Optional für Termin-/Zeitumfrage
    status: "aktiv" | "entwurf" | "geschlossen";
}

interface SurveyListProps {
    surveyList: Survey[];
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

const SurveyList: React.FC<SurveyListProps> = ({surveyList = []}) => {
    const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSurveyClick = (survey: Survey) => {
        setSelectedSurvey(survey);
        setIsModalOpen(true);
    };

    return (
        <div>
            {surveyList.length === 0 ? (
                <p className="text-gray-500">Keine Umfragen vorhanden.</p>
            ) : (
                <div>
                    {surveyList.map((survey, index) => (
                        <Card
                            isPressable
                            key={index}
                            className="w-full mb-3 hover:bg-gray-50 "
                            onPress={() => handleSurveyClick(survey)}
                        >
                            <CardBody>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{survey.title}</h3>
                                        <p className="text-gray-600 text-sm">{survey.description}</p>
                                    </div>
                                    <StatusBadge status={survey.status}/>
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {isModalOpen && selectedSurvey && (
                <ModalWindow
                    isOpen={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    size="lg"
                    content={
                        <MultipleChoiceSurvey
                            title={selectedSurvey.title}
                            description={selectedSurvey.description}
                            options={selectedSurvey.options || []}
                            schedule={selectedSurvey.schedule || []}
                        />
                    }
                />
            )}
        </div>
    );
};

export default SurveyList;
