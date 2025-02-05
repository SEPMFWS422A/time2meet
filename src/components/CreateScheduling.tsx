import React, {useState} from "react";
import {DayPicker} from "react-day-picker";
import "react-day-picker/dist/style.css";
import {Form, TimeInput} from "@heroui/react";
import {MappedTimeValue, TimeValue} from "@react-types/datepicker";
import {CalendarDateTime, Time, ZonedDateTime} from "@internationalized/date";

export interface SchedulingSurvey {
    dates: Date[];
    timeStart: TimeValue | undefined;
    timeEnd: TimeValue | undefined;
}

const CreateScheduling: React.FC = () => {
    const [schedulingSurvey, setSchedulingSurvey] = useState<SchedulingSurvey>({
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

    const handleTimeChange = (
        field: "timeStart" | "timeEnd",
        value: MappedTimeValue<Time | CalendarDateTime | ZonedDateTime> | null
    ) => {
        setSchedulingSurvey((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div>
            <Form onSubmit={handleSubmit}>
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
            </Form>
        </div>
    );
}

export default CreateScheduling;