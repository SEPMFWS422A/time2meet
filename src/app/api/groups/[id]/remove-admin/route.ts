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

        const { adminId } = await req.json();
        
        if(!group.admins.includes(adminId)){
            return NextResponse.json({ success: false, error: "Der Benutzer ist kein Admin" }, { status: 400 }); 
        }
        group.admins = group.admins.filter((admin: string) => admin.toString() !== adminId.toString());
        await group.save()
        return NextResponse.json({ success: true, message: "Adminrechte entzogen" }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}