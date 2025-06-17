import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import mongoose from "mongoose";
import { getUserID, getGroup } from "@/lib/helper";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    id: string;
    email: string;
    username: string;
}


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
    try {
        await dbConnect();
        const token = req.cookies.get("token")?.value;
        if(!token){
            return NextResponse.json({ success: false, error: "Nicht Authentifiziert" }, { status: 401 });
        }
        let decodedToken: DecodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as DecodedToken;
        } catch (error) {
            return NextResponse.json({ success: false, error: "Ungültiges Token" }, { status: 403 });
        }
        
        const user = decodedToken.id;


        const groupId = (await params).id as string;
        const group = await getGroup(groupId);
        console.log("user: ", user);
        console.log("group: ", group);

        if(group.error){
            console.log("group.error: ", group.error);
            return NextResponse.json({ success: false, error: group.error}, { status: group.status });
        }
 
       console.log("got here");
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
