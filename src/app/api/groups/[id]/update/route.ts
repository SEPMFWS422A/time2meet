import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import { getUserID, getGroup } from "@/lib/helper";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getUserID(req);
        if(user.error){
            return NextResponse.json({ success: false, error: user.error}, { status: user.status });
        }

        const groupId = (await params).id;
        const group = await getGroup(groupId);
        if(group.error){
            return NextResponse.json({ success: false, error: group.error }, { status: group.status });
        }
        if(!group.admins.includes(user.id)){
            return NextResponse.json({ success: false, error: "Nicht berechtigt, Gruppendaten zu aktualisieren" }, { status: 403 });
        }

        const { groupname, beschreibung } = await req.json();
        if(groupname) group.groupname = groupname;
        if(beschreibung) group.beschreibung = beschreibung;
        await group.save();

        return NextResponse.json({ success: true, data: group }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}