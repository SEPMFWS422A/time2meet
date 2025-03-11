export const mergeSurveyData = (
    surveyData: {
        title: string;
        description: string;
        location: string;
        options: string[];
        status: string;
        participants: string[] | undefined
    },
    schedulingData: {
        dates: { date: Date; times: { start: string; end: string }[] }[]
    }
) => {
        // ich musste das Date-Objekt so umwandeln das es nicht mehr UTC verwendet um einen "Vergangenheitsfehler" bei richtig ausgewähltem Datum zu umgehen
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); 
        const day = String(date.getDate()).padStart(2, '0');
        console.log(`${year}-${month}-${day}`)
        return `${year}-${month}-${day}`;
    };

    // Zeit in HH:mm auch für den Post req
    const formatTime = (time: string): string => {
        return time.split(':').slice(0, 2).join(':'); 
    };

    // hab das default für den ablauf der Survey auf 20 tage nach erstellung gesetzt
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 20);

    return {
        title: surveyData.title,
        description: surveyData.description,
        location: surveyData.location,
        options: surveyData.options.map((option) => ({ title: option })), 
        dateTimeSelections: schedulingData.dates.map((d) => ({
            date: formatDate(d.date), 
            timeSlots: d.times.map((t) => ({
                startTime: formatTime(t.start), 
                endTime: formatTime(t.end), 
            })),
        })),
        expiresAt: formatDate(expiresAt), 
        status: surveyData.status, 
        participants: surveyData.participants ?? [] 
    };
};