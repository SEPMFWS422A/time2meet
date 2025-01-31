import React, {useState} from "react";
import {DayPicker} from "react-day-picker";
import "react-day-picker/dist/style.css";
import {Button, Form, Input, TimeInput} from "@heroui/react";
import {MappedTimeValue, TimeValue} from "@react-types/datepicker";
import {CalendarDateTime, Time, ZonedDateTime} from "@internationalized/date";
import {CheckIcon, CloseIcon} from "@heroui/shared-icons";

export interface SchedulingSurvey {
    title: string;
    description: string;
    dates: Date[];
    timeStart: TimeValue | undefined;
    timeEnd: TimeValue | undefined;
}

interface CreateSchedulingProps {
    onClose: () => void
}

const CreateScheduling: React.FC<CreateSchedulingProps> = ({onClose}) => {
    const [schedulingSurvey, setSchedulingSurvey] = useState<SchedulingSurvey>({
        title: "",
        description: "",
        dates: [],
        timeStart: undefined,
        timeEnd: undefined,
    });

    const handleDateSelect = (dates: Date[] | undefined) => {
        setSchedulingSurvey((prev) => ({
            ...prev,
            dates: dates || [],
        }));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log(schedulingSurvey);
    };

    const handleInputChange = (field: keyof SchedulingSurvey, value: string) => {
        setSchedulingSurvey((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleTimeChange = (
        field: "timeStart" | "timeEnd",
        value: MappedTimeValue<Time | CalendarDateTime | ZonedDateTime> | null
    ) => {
        setSchedulingSurvey((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const getFormData = () => {
        onClose();
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Input
                    isRequired
                    label="Titel"
                    labelPlacement="outside"
                    name="Titel"
                    placeholder="Titel der Umfrage angeben"
                    type="text"
                    onChange={(e) => handleInputChange("title", e.target.value)}
                />
                <Input
                    label="Beschreibung"
                    labelPlacement="outside"
                    name="description"
                    placeholder="Beschreibung angeben"
                    type="text"
                    onChange={(e) => handleInputChange("description", e.target.value)}
                />
                <div className="flex flex-col items-center">
                    <DayPicker

                        weekStartsOn={1}
                        mode="multiple"
                        disabled={{before: new Date()}}
                        selected={schedulingSurvey.dates}
                        onSelect={handleDateSelect}
                    />
                    <div className="flex flex-row gap-5 w-full">
                        <TimeInput
                            label="Uhrzeit von" variant="bordered"
                            onChange={(value) => handleTimeChange("timeStart", value)}
                        />
                        <TimeInput
                            label="Uhrzeit bis" variant="bordered"
                            onChange={(value) => handleTimeChange("timeEnd", value)}
                        />
                    </div>
                </div>
                <div>
                    <Button color="danger" variant="light" onPress={onClose}>
                        <CloseIcon/>
                        Schließen
                    </Button>
                    <Button color="primary" onPress={getFormData}>
                        <CheckIcon/>
                        Abschicken
                    </Button>
                </div>

            </Form>
        </div>
    );
}

export default CreateScheduling;