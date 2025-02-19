import { NextApiRequest, NextApiResponse } from "next";
import Event from "../../../lib/models/event";
import dbConnect from "@/lib/database/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();
    const { id } = req.query;

    switch (req.method) {
        case "GET":
            return getEventById(id as string, res);
        case "PUT":
            return updateEvent(id as string, req, res);
        case "DELETE":
            return deleteEvent(id as string, res);
        default:
            res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

async function getEventById(id: string, res: NextApiResponse) {
    try {
        // const event = await Event.findById(id).populate("creator members groups");
        const event = await Event.findById(id).populate("groups");


        if (!event) {
            return res.status(404).json({ error: "Event nicht gefunden." });
        }

        return res.status(200).json(event);
    } catch (error) {
        console.error("Fehler beim Abrufen des Events:", error);
        return res.status(500).json({ error: "Fehler beim Abrufen des Events." });
    }
}

async function updateEvent(id: string, req: NextApiRequest, res: NextApiResponse) {
    try {
        // const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true }).populate("creator members groups");
        const updatedEvent = await Event.findByIdAndUpdate(id, req.body, { new: true }).populate("groups");
        console.log("🔍 Alle Events:", updatedEvent); // Debuggingbugging
        if (!updatedEvent) {
            return res.status(404).json({ error: "Event nicht gefunden." });
        }

        return res.status(200).json(updatedEvent);
    } catch (error) {
        console.error("Fehler beim Aktualisieren des Events:", error);
        return res.status(500).json({ error: "Fehler beim Aktualisieren des Events." });
    }
}

async function deleteEvent(id: string, res: NextApiResponse) {
    try {
        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({ error: "Event nicht gefunden." });
        }

        return res.status(200).json({ message: "Event erfolgreich gelöscht." });
    } catch (error) {
        console.error("Fehler beim Löschen des Events:", error);
        return res.status(500).json({ error: "Fehler beim Löschen des Events." });
    }
}
