import { NextApiRequest, NextApiResponse } from "next";
import Event from "../../../lib/models/event";
import dbConnect from "@/lib/database/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();

    if (req.method === "GET") {
        try {
            const events = await Event.find().populate("creator members groups");

            if (!events || events.length === 0) {
                return res.status(404).json({ error: "Keine Events gefunden." });
            }

            return res.status(200).json(events);
        } catch (error) {
            console.error("Fehler beim Abrufen der Events:", error);
            return res.status(500).json({ error: "Fehler beim Abrufen der Events." });
        }
    }


    if (req.method === "POST") {
        console.log("🔄 POST Request erhalten:", req.body);

        try {
            const { creator, title, start, end, description, location, groups, members, allday } = req.body;

            if (!creator || !title || !start || !end) {
                console.error("❌ Fehlende Pflichtfelder!");
                return res.status(400).json({ error: "creator, title, start und end sind erforderlich." });
            }

            const newEvent = new Event({
                creator,
                members,
                title,
                start,
                end,
                description,
                location,
                groups,
                allday,
            });

            await newEvent.save();
            console.log("✅ Event erfolgreich gespeichert:", newEvent);
            return res.status(201).json(newEvent);
        } catch (error) {
            console.error("❌ Fehler beim Speichern des Events:", error);
            return res.status(500).json({ error: "Fehler beim Erstellen des Events." });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
