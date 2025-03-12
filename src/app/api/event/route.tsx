import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/Event";
import { getUserID } from "@/lib/helper";

export async function GET(req: NextRequest) {
  await dbConnect();
  const user = await getUserID(req);

  if (user.error) {
    return NextResponse.json({ success: false, error: user.error }, { status: user.status });
  }

  try {
    // Events des Nutzers abrufen
    const userEvents = await Event.find({
      $or: [{ creator: user.id }, { members: user.id }]
    })
        .select("title start end allday description location")
        .lean();

    if (!userEvents.length) {
      return NextResponse.json({ success: false, error: "Keine Events gefunden." }, { status: 404 });
    }

    // Konvertiere Events ins iCalendar-Format
    const vevents = userEvents.map((event) => {
      let start = "";
      let end = "";

      if (event.allday) {
        const startDate = new Date(event.start);
        start = `;VALUE=DATE:${startDate.getFullYear()}${(startDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${startDate.getDate().toString().padStart(2, "0")}`;

        const nextDay = new Date(startDate);
        nextDay.setDate(nextDay.getDate() + 1);
        end = `;VALUE=DATE:${nextDay.getFullYear()}${(nextDay.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${nextDay.getDate().toString().padStart(2, "0")}`;
      } else {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);
        start = `:${startDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
        end = `:${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
      }

      return `
BEGIN:VEVENT
SUMMARY:${event.title}
DTSTART${start}
DTEND${end}
DESCRIPTION:${event.description || ""}
LOCATION:${event.location || "Online"}
END:VEVENT
      `.trim();
    });

    const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
CALSCALE:GREGORIAN
${vevents.join("\n")}
END:VCALENDAR
    `.trim();

    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar",
        "Content-Disposition": 'attachment; filename="events.ics"',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
