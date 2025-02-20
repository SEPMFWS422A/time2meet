import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Form, TimeInput } from "@heroui/react";
import { MappedTimeValue, TimeValue } from "@react-types/datepicker";
import { CalendarDateTime, Time, ZonedDateTime } from "@internationalized/date";
import { Trash2 } from "lucide-react";

export interface SchedulingSurvey {
    dates: { date: Date; times: { start: TimeValue | null | undefined; end: TimeValue | null | undefined }[] }[];
}

const CreateScheduling: React.FC = () => {
    const [schedulingSurvey, setSchedulingSurvey] = useState<SchedulingSurvey>({
        dates: [],
    });

    const [useSameTimeForAllDates, setUseSameTimeForAllDates] = useState(true);
    const [commonStartTime, setCommonStartTime] = useState<TimeValue | null | undefined>(undefined);
    const [commonEndTime, setCommonEndTime] = useState<TimeValue | null | undefined>(undefined);

    const handleDateSelect = (dates: Date[] | undefined) => {
        if (dates) {
            setSchedulingSurvey((prev) => {
                const updatedDates = dates.map((date) => {
                    const existingDate = prev.dates.find((d) => d.date.getTime() === date.getTime());
                    return {
                        date,
                        times: existingDate ? existingDate.times : [], // Zeiten beibehalten, wenn Datum bereits vorhanden ist
                    };
                });
                return { dates: updatedDates };
            });
        } else {
            setSchedulingSurvey({ dates: [] });
        }
    };

    const handleTimeChange = (
        date: Date,
        index: number,
        field: "start" | "end",
        value: MappedTimeValue<Time | CalendarDateTime | ZonedDateTime> | null
    ) => {
        if (useSameTimeForAllDates) {
            if (field === "start") setCommonStartTime(value);
            if (field === "end") setCommonEndTime(value);
        } else {
            setSchedulingSurvey((prev) => {
                const updatedDates = prev.dates.map(d => {
                    if (d.date.getTime() === date.getTime()) {
                        const updatedTimes = [...d.times];
                        if (!updatedTimes[index]) {
                            updatedTimes[index] = { start: undefined, end: undefined };
                        }
                        updatedTimes[index][field] = value;
                        return { ...d, times: updatedTimes };
                    }
                    return d;
                });

                return { dates: updatedDates };
            });
        }
    };

    const addTimeSlot = (date: Date) => {
        setSchedulingSurvey((prev) => {
            const updatedDates = prev.dates.map(d => {
                if (d.date.getTime() === date.getTime()) {
                    return { ...d, times: [...d.times, { start: undefined, end: undefined }] };
                }
                return d;
            });
            return { dates: updatedDates };
        });
    };

    const removeTimeSlot = (date: Date, index: number) => {
        setSchedulingSurvey((prev) => {
            const updatedDates = prev.dates.map(d => {
                if (d.date.getTime() === date.getTime()) {
                    const updatedTimes = d.times.filter((_, i) => i !== index);
                    return { ...d, times: updatedTimes };
                }
                return d;
            });
            return { dates: updatedDates };
        });
    };

    const handleUseSameTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUseSameTimeForAllDates(event.target.checked);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        console.log(schedulingSurvey);
    };

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center">
                    <DayPicker
                        weekStartsOn={1}
                        mode="multiple"
                        disabled={{ before: new Date() }}
                        selected={schedulingSurvey.dates.map(d => d.date)}
                        onSelect={handleDateSelect}
                    />

                    <label>
                        Gleiche Uhrzeit für alle Daten verwenden:
                        <input
                            type="checkbox"
                            checked={useSameTimeForAllDates}
                            onChange={handleUseSameTimeChange}
                        />
                    </label>

                    {useSameTimeForAllDates ? (
                        <div className="mt-4 flex flex-row gap-5 w-full">
                            <TimeInput
                                label="Uhrzeit von"
                                variant="bordered"
                                value={commonStartTime}
                                onChange={(value) => handleTimeChange(new Date(), 0, "start", value)}
                            />
                            <TimeInput
                                label="Uhrzeit bis"
                                variant="bordered"
                                value={commonEndTime}
                                onChange={(value) => handleTimeChange(new Date(), 0, "end", value)}
                            />
                        </div>
                    ) : (
                        schedulingSurvey.dates.map((selectedDate) => (
                            <div key={selectedDate.date.getTime()} className="mt-4 w-full ">
                                <h3 className="text-xl font-bold mb-2 text-left">{selectedDate.date.toLocaleDateString()}</h3>
                                {selectedDate.times.map((timeSlot, index) => (
                                    <div key={index} className="flex flex-row gap-5 w-full mb-2">
                                        <TimeInput
                                            label="Uhrzeit von"
                                            variant="bordered"
                                            value={timeSlot.start}
                                            onChange={(value) => handleTimeChange(selectedDate.date, index, "start", value)}
                                        />
                                        <TimeInput
                                            label="Uhrzeit bis"
                                            variant="bordered"
                                            value={timeSlot.end}
                                            onChange={(value) => handleTimeChange(selectedDate.date, index, "end", value)}
                                        />
                                        <button type="button" onClick={() => removeTimeSlot(selectedDate.date, index)}>
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                                <button type="button" onClick={() => addTimeSlot(selectedDate.date)}>
                                    Zeit hinzufügen
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </Form>
        </div>
    );
};

export default CreateScheduling;