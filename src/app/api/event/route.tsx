import { NextResponse } from 'next/server';

export async function GET() {
    const event = {
        start: "20250116T120000Z", 
        end: "20250116T130000Z", 
        title: "Statisches Event",
        description: "Dies ist ein statisches Beispiel-Event.",
        location: "Online"
    };

    // ICS-Dateiinhalt 
    const icsContent = `
    BEGIN:VCALENDAR
    VERSION:2.0
    CALSCALE:GREGORIAN
    BEGIN:VEVENT
    SUMMARY:${event.title}
    DTSTART:${event.start}
    DTEND:${event.end}
    DESCRIPTION:${event.description}
    LOCATION:${event.location}
    END:VEVENT
    END:VCALENDAR
    `.trim();

    return new NextResponse(icsContent, {
        headers: {
            'Content-Type': 'text/calendar',
            'Content-Disposition': 'attachment; filename="event.ics"',
        },
    });
}
