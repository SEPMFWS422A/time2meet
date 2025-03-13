import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import mongoose from "mongoose";
import { getUserID, getGroup } from "@/lib/helper";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
    try {
        await dbConnect();
        const user = await getUserID(req);
        const groupId = (await params).id as string;
        const group = await getGroup(groupId);

        if(group.error){
            return NextResponse.json({ success: false, error: group.error}, { status: group.status });
        }
 
       
       if(!group.members.some((member: mongoose.Types.ObjectId) => member.equals(user.id))){
        return NextResponse.json({ success: false, error: "Zugriff verweigert"}, { status: 403 });
       }

        return NextResponse.json({ success: true, data: group }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const user = await getUserID(req);
        const groupId = (await params).id as string;
        const group = await getGroup(groupId);

        console.log("user: ", user);
        console.log("group: ", group);

        if(group.error){
            return NextResponse.json({ success: false, error: group.error}, { status: group.status });
        }

        if(group.creator.toString() !== user.id) {
            return NextResponse.json({ success: false, error: "Nicht berechtigt, diese Gruppe zu löschen" }, { status: 403 });
        }

        await Group.findByIdAndDelete(group._id);

        return NextResponse.json({ success: true, message: "Gruppe wurde gelöscht" }, { status: 200});
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
