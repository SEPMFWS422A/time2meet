import { NextRequest, NextResponse } from "next/server";
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
        if(group.creator.toString() !== user.id){
            return NextResponse.json({ success: false, error: "Nur der Creator kann neue Admins hinzufügen" }, { status: 403 });
        }

        const { newAdmin } = await req.json();
        
        if(!group.admins.includes(newAdmin)){
            group.admins.push(newAdmin);
            if(!group.members.includes(newAdmin)) {
                group.members.push(newAdmin);
            }
            await group.save();
            return NextResponse.json({ success: true, message: "Admin hinzugefügt" }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, error: "Diese user ist schon admin diese Gruppe." }, { status: 403 });
        }
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}