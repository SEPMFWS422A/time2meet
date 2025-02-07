import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/group";

type Data =
    | { success: boolean; data?: any}
    | { success: boolean; error: string};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    await dbConnect();

    const { id } = req.query;

    switch(req.method) {
        case "GET":
            try {
                const group = await Group.findById(id)
                    .populate("creator")
                    .populate("admins")
                    .populate("members");
                
                    if(!group) {
                        return res.status(404).json({success: false, error: "Gruppe nicht gefunden."});
                    }
                    return res.status(200).json({ success: true, data: group});
            } catch (error: any) {
                return res.status(400).json({ success: false, error: error.message });
            }
        
        case "PUT":
            try {
                const { groupname, beschreibung, admin, member } = req.body;

                const group = await Group.findById(id);

                if(!group) {
                    return res.status(400).json({ success: false, error: "Gruppe nicht gefunden."});
                }

                if(groupname){
                    group.groupname = groupname;
                }

                if(beschreibung) {
                    group.beschreibung = beschreibung;
                }

                if(admin) {
                    if(!group.admins.map((a: any) => a.toString()).includes(admin)){
                        group.admins.push(admin);
                    }
                }

                if(member) {
                    if(!group.members.map((m: any) => m.toString()).includes(member)) {
                        group.members.push(member);
                    }
                }

                const updatedGroup = await group.save();

                const populatedGroup = await Group.findById(updatedGroup._id)
                    .populate("creator")
                    .populate("admins")
                    .populate("members");

                return res.status(200).json({ success: true, data: populatedGroup });
            } catch (error: any) {
                return res.status(400).json({ success: false, error: error.message});
            }
        
        default:
            res.setHeader("Allow", ["GET", "PUT"]);
            return res.status(405).json({success: false, error: `Methode ${req.method} nicht erlaubt.`});
    }
}