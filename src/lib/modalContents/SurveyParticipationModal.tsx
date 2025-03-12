import React, { useState } from "react";
import { Button, Card, CardBody, CardHeader, Radio, RadioGroup } from "@heroui/react";
import { LucideBadgeCheck } from "lucide-react";
import DateSurvey from "@/components/DateSurvey";
import { Survey } from "@/lib/interfaces/ISurvey";

interface SurveyProps {
    survey: Survey;
}

interface ScheduleAnswer {
    date: Date;
    startTime: string;
    endTime: string;
    response: "ja" | "nein" | "vielleicht";
}

const SurveyParticipationModal: React.FC<SurveyProps> = ({ survey }) => {
    const [selectedDateTimeSlots, setSelectedDateTimeSlots] = useState<ScheduleAnswer[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const handleTimeSlotChange = (date: Date, startTime: string, endTime: string, response: "ja" | "nein" | "vielleicht") => {
        setSelectedDateTimeSlots((prevSlots) => {
            const existingIndex = prevSlots.findIndex(
                (slot) => slot.date.getTime() === date.getTime() && slot.startTime === startTime && slot.endTime === endTime
            );

            if (existingIndex !== -1) {
                const updatedSlots = [...prevSlots];
                updatedSlots[existingIndex].response = response;
                return updatedSlots;
            } else {
                return [...prevSlots, { date, startTime, endTime, response }];
            }
        });
    };

    const handleSubmit = () => {
        //Hier POST API Aufrufen
        console.log("Ausgewählte Aktivität:", selectedOption);
        console.log("Antworten auf die Terminfindung:", selectedDateTimeSlots);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center bg-blue-600 text-white py-4 rounded-t-lg">
                    <h2 className="text-2xl font-bold">{survey.title}</h2>
                </CardHeader>

                <CardBody className="p-6 bg-white">
                    <form className="flex flex-col gap-2">
                        <p className="text-center text-xl font-semibold mb-6">{survey.description}</p>

                        {/* Aktivitätsumfrage */}
                        {survey.options.length > 0 && (
                            <div className="flex justify-center">
                                <RadioGroup
                                    label="Wähle eine Aktivität"
                                    value={selectedOption}
                                    onValueChange={setSelectedOption}
                                >
                                    {survey.options.map((option) => (
                                        <Radio key={option.title} value={option.title}>
                                            {option.title}
                                        </Radio>
                                    ))}
                                </RadioGroup>
                            </div>
                        )}

                        {/* Terminfindungsumfrage */}
                        {survey.dateTimeSelections.length > 0 && (
                            <DateSurvey dateTimeSelections={survey.dateTimeSelections} onTimeSlotChange={handleTimeSlotChange} />
                        )}

                        <Button
                            endContent={<LucideBadgeCheck />}
                            className="w-full text-lg font-semibold"
                            color="primary"
                            onPress={handleSubmit}
                        >
                            Abschicken
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default SurveyParticipationModal;
