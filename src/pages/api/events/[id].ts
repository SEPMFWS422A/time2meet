import { NextApiRequest, NextApiResponse } from "next";

import Event from "../../../lib/models/event";
import dbConnect from "@/lib/database/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    await dbConnect();
    const { id } = req.query;

    if (req.method === "GET") {
        try {
            // Event anhand der ID abrufen
            const event = await Event.findById(id).populate("creator members groups");

            if (!event) {
                return res.status(404).json({ error: "Event nicht gefunden." });
            }

            return res.status(200).json(event);
        } catch (error) {
            console.error("Fehler beim Abrufen des Events:", error);
            return res.status(500).json({ error: "Fehler beim Abrufen des Events." });
        }
    }

    if (req.method === "DELETE") {
        // Event löschen
        try {
            const deletedEvent = await Event.findByIdAndDelete(id);

            if (!deletedEvent) {
                return res.status(404).json({ error: "Event nicht gefunden." });
            }

            return res.status(200).json({ message: "Event erfolgreich gelöscht." });
        } catch (error) {
            return res.status(500).json({ error: "Fehler beim Löschen des Events." });
        }
    }

    res.setHeader("Allow", ["GET", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
