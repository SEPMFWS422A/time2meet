// components/DateSurvey.tsx
import React from "react";

interface DaySchedule {
    date: string;
    timeSlots: string[];
}

interface ScheduleSurveyProps {
    schedule: DaySchedule[];
    onTimeSlotChange: (date: string, time: string, value: "ja" | "nein" | "vielleicht") => void;
}

const DateSurvey: React.FC<ScheduleSurveyProps> = ({ schedule, onTimeSlotChange }) => {
    return (
        <>
            {schedule.map((day) => (
                <div key={day.date} className="border rounded-lg shadow-sm p-4">
                    <h3 className="bg-blue-600 text-white text-lg font-bold text-center py-1 rounded-md">
                        {day.date}
                    </h3>
                    <ul className="space-y-2 mt-2">
                        {day.timeSlots.map((time) => (
                            <li key={time} className="flex flex-col items-center">
                                <p className="text-lg font-semibold">{time}</p>
                                <div className="flex space-x-4 mt-2">
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name={`${day.date}-${time}`}
                                            value="ja"
                                            onChange={() => onTimeSlotChange(day.date, time, "ja")}
                                        />
                                        <span>Ja</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name={`${day.date}-${time}`}
                                            value="nein"
                                            onChange={() => onTimeSlotChange(day.date, time, "nein")}
                                        />
                                        <span>Nein</span>
                                    </label>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="radio"
                                            name={`${day.date}-${time}`}
                                            value="vielleicht"
                                            onChange={() => onTimeSlotChange(day.date, time, "vielleicht")}
                                        />
                                        <span>Vielleicht</span>
                                    </label>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </>
    );
};

export default DateSurvey;
