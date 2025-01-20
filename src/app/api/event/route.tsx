import { NextResponse } from 'next/server';
import  { events } from "@/app/lib/data/events";


export async function GET() {

    const vevents = events.map((events) => {

        let start = "";
        let end = "";

        if (events.allDay == true) {
            start = ";VALUE=DATE:" + String(events.start).replace(/[-:]/g, "").split('T')[0];

            const newDate = new Date(events.start as string);
            newDate.setDate(newDate.getDate() + 1);
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, '0');  // Monat ist 0-basiert
            const day = String(newDate.getDate()).padStart(2, '0');
            end = ";VALUE=DATE:" + year+month+day
            console.log(end);

        } else {
            start = ":" + String(events.start).replace(/[-:]/g, "");
            end = ":" + String(events.end).replace(/[-:]/g, "");

        }

        return `
BEGIN:VEVENT
SUMMARY:${events.title}
DTSTART${start}
DTEND${end}
DESCRIPTION:${events.description || ''}
LOCATION:${events.location || 'Online'}
END:VEVENT
    `.trim();
    });

    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
${vevents.join('\n')}
END:VCALENDAR
  `.trim();

    return new NextResponse(icsContent, {
        headers: {
            'Content-Type': 'text/calendar',
            'Content-Disposition': 'attachment; filename="events.ics"',
        },
    });
}