"use client";
import React, {useState} from "react";
import {Button, Card, CardBody, CardHeader} from "@heroui/react";
import {LucideBadgeCheck} from "lucide-react";
import DateSurvey from "@/components/DateSurvey";
import {closestCenter, DndContext, DragEndEvent} from "@dnd-kit/core";
import {SortableContext, useSortable, verticalListSortingStrategy} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

interface DaySchedule {
    date: string;
    timeSlots: string[];
}

interface SurveyProps {
    title: string;
    description: string;
    options?: string[];
    schedule?: DaySchedule[];
}

interface ScheduleAnswer {
    date: string;
    time: string;
    answer: "ja" | "nein" | "vielleicht";
}

const SortableItem = ({id}: { id: string }) => {
    const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id});

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "10px",
        margin: "5px 0",
        backgroundColor: "#f3f4f6",
        borderRadius: "5px",
        cursor: "grab",
        textAlign: "center",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {id}
        </div>
    );
};

const MultipleChoiceSurvey: React.FC<SurveyProps> = ({title, description, options = [], schedule = []}) => {
    const [answers, setAnswers] = useState<ScheduleAnswer[]>([]);
    const [activityOptions, setActivityOptions] = useState(options);

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;
        if (!over || active.id === over.id) return;

        setActivityOptions((prev) => {
            const oldIndex = prev.indexOf(active.id as string);
            const newIndex = prev.indexOf(over.id as string);
            const newOptions = [...prev];
            newOptions.splice(oldIndex, 1);
            newOptions.splice(newIndex, 0, active.id as string);
            return newOptions;
        });
    };

    const handleTimeSlotChange = (date: string, time: string, value: "ja" | "nein" | "vielleicht") => {
        setAnswers((prevAnswers) => {
            const existingAnswerIndex = prevAnswers.findIndex((answer) => answer.date === date && answer.time === time);
            if (existingAnswerIndex >= 0) {
                const updatedAnswers = [...prevAnswers];
                updatedAnswers[existingAnswerIndex] = {date, time, answer: value};
                return updatedAnswers;
            } else {
                return [...prevAnswers, {date, time, answer: value}];
            }
        });
    };

    const handleSubmit = () => {
        console.log("Antworten auf die Aktivität (in Reihenfolge der Priorität):", activityOptions);
        console.log("Antworten auf die Terminfindung:", answers);
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader className="text-center bg-blue-600 text-white py-4 rounded-t-lg">
                    <p className="text-2xl font-bold">{title}</p>
                </CardHeader>
                <CardBody className="p-6 bg-white">
                    <form>
                        <p className="text-center text-xl font-semibold mb-4">{description}</p>

                        {/* Aktivitätsumfrage mit Drag-and-Drop */}
                        {activityOptions.length > 0 && (
                            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={activityOptions} strategy={verticalListSortingStrategy}>
                                    <div className="space-y-2">
                                        {activityOptions.map((option) => (
                                            <SortableItem key={option} id={option}/>
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        )}

                        {/* Terminfindungsumfrage */}
                        {schedule.length > 0 && (
                            <div className="space-y-4">
                                <DateSurvey schedule={schedule} onTimeSlotChange={handleTimeSlotChange}/>
                            </div>
                        )}

                        <Button endContent={<LucideBadgeCheck/>} className="w-full mt-6 text-lg" onPress={handleSubmit}>
                            Abschicken
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default MultipleChoiceSurvey;
