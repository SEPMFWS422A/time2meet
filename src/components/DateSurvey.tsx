import React from "react";
import {Radio, RadioGroup} from "@heroui/react";

interface ScheduleSurveyProps {
    dateTimeSelections: {
        date: Date;
        timeSlots: {
            startTime: string;
            endTime: string;
            yesVoters: string[];
            noVoters: string[];
            maybeVoters: string[];
        }[];
    }[];
    onTimeSlotChange: (date: Date, startTime: string, endTime: string, response: "ja" | "nein" | "vielleicht") => void;
}

const DateSurvey: React.FC<ScheduleSurveyProps> = ({dateTimeSelections, onTimeSlotChange}) => {
    return (
        <>
            {dateTimeSelections.map((day, index) => (
                <div key={`${index}-${day.date.toString()}`} className="border rounded-lg shadow-md p-4 bg-white">
                    <h3 className="bg-blue-600 text-white text-lg font-bold text-center py-2 rounded-md">
                        {day.date.toString()}
                    </h3>

                    <ul className="space-y-4 mt-4">
                        {day.timeSlots.map((time, index) => (
                            <li
                                key={`${index}_${time.startTime}-${time.endTime}`}
                                className="flex flex-col items-center bg-gray-100 p-3 rounded-lg shadow-sm"
                            >
                                <p className="text-lg font-semibold text-gray-800">
                                    {time.startTime} - {time.endTime} Uhr
                                </p>
                                <RadioGroup
                                    orientation="horizontal"
                                    name={`${day.date}-${time.startTime}-${time.endTime}`}
                                    onValueChange={(value) => onTimeSlotChange(day.date, time.startTime, time.endTime, value as "ja" | "nein" | "vielleicht")}
                                    className="mt-2"
                                >
                                    <Radio value="ja" color="success">Ja</Radio>
                                    <Radio value="nein" color="danger">Nein</Radio>
                                    <Radio value="vielleicht" color="warning">Vielleicht</Radio>
                                </RadioGroup>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </>
    );
};

export default DateSurvey;
