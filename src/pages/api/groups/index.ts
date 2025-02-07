import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/group";

type Data =
    | { success: boolean; data?: any}
    | { success: boolean; error: string};

export default async function handler (
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    await dbConnect();

    switch(req.method) {
        case "GET":
            try {
                const groups = await Group.find({}).populate("creator");
                return res.status(200).json({ success: true, data: groups});
            } catch (error: any) {
                return res.status(400).json({success: false, error: error.message});
            }
        
        case "POST":
            try {
                const {groupname, beschreibung, creator } = req.body;
                if (!groupname || !creator) {
                    return res.status(400).json({ success: false, error: "groupname und creator sind erforderlich."});
                }

                const newGroup = await Group.create({groupname, beschreibung, creator});
                return res.status(201).json({ success: true, data: newGroup});
            } catch (error : any) {
                return res.status(400).json({success: false, error: error.message});
            }
        
        default:
            res.setHeader("Allow", ["GET", "POST"]);
            return res.status(405).json({success: false, error: `Methode ${req.method} nicht erlaubt.`})
    }
}