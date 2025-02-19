import type { NextApiRequest, NextApiResponse } from "next";
import User from "@/lib/models/user";
import Group from "@/lib/models/group";
import dbConnect from "@/lib/database/dbConnect";
import Event from "@/lib/models/event";


type Data =
    | { success: boolean; data?: any }
    | { success: boolean; error: string };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    await dbConnect();

    switch (req.method) {
        case "GET":
            return getAllEvents(res);
        case "POST":
            return createEvent(req, res);
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).json({ success: false, error: `Methode ${req.method} nicht erlaubt.` });
    }
}

async function getAllEvents(res: NextApiResponse) {
    try {
        // const events = await Event.find().populate("creator members groups");
        const events = await Event.find().populate("groups"); // "creator" und "members" entfernt




        if (!events || events.length === 0) {
            console.log("⚠️ Keine Events in der Datenbank gefunden!");
            return res.status(404).json({ success: false, error: "Keine Events gefunden." });
        }

        return res.status(200).json({ success: true, data: events });
    } catch (error: any) {
        console.error("❌ Fehler beim Abrufen der Events:", error);
        return res.status(500).json({ success: false, error: "Fehler beim Abrufen der Events." });
    }
}


async function createEvent(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { creator, title, start, end, description, location, groups, members, allday } = req.body;

        if (!creator || !title || !start || !end) {
            return res.status(400).json({ success: false, error: "creator, title, start und end sind erforderlich." });
        }

        const newEvent = await Event.create({
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

        return res.status(201).json({ success: true, data: newEvent });
    } catch (error: any) {
        console.error("Fehler beim Erstellen des Events:", error);
        return res.status(500).json({ success: false, error: "Fehler beim Erstellen des Events." });
    }
}
