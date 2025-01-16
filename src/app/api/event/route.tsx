import { NextResponse } from 'next/server';

export async function GET() {
    const event = {
        start: "20250116T120000", // Startzeit (UTC-Zeit)
        end: "20250116T130000", // Endzeit (UTC-Zeit)
        title: "Statisches Event",
        description: "Dies ist ein statisches Beispiel-Event.",
        location: "Online"
    };

    // ICS-Dateiinhalt generieren
    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART;TZID=Europe/Berlin:20250116T120000
DTEND;TZID=Europe/Berlin:20250116T130000
DTSTAMP:20250116T100000Z
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR
`.trim();
    // console.log('ICS File Content:\n', icsContent);

    return new NextResponse(icsContent, {
        headers: {
            'Content-Type': 'text/calendar',
            'Content-Disposition': 'attachment; filename="event.ics"',
        },
    });
}
