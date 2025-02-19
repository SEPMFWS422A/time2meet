import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import jwt, { JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

interface DecodedToken extends JwtPayload {
    id: string;
    email: string;
    username: string;
}

async function getUserID(req: NextRequest){
    await dbConnect();
    const token = req.cookies.get("token")?.value;
    if(!token) {
        return { error: "Nicht authentifiziert", status: 401};
    }
    let decodedToken: DecodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as DecodedToken;
    } catch (error) {
        return { error: "Ungültiges Token", status: 403 };
    }
    const id = decodedToken.id;
    return { id };
}

async function getGroup(groupId: string) {
    await dbConnect();
    const group = await Group.findById(groupId).populate("members");
    if(!group) {
        return { error: `Gruppe nicht gefunden '${groupId}'`, status: 404 };
    }
    return { group };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> } ) {
    try {
        const user = await getUserID(req);
        const groupId = (await params).id as string;
        const result = await getGroup(groupId);
        if(result.error){
            return NextResponse.json({ success: false, error: result.error}, { status: result.status });
        }
        const group = result.group;
       
       if(!group.members.some((member: mongoose.Types.ObjectId) => member.equals(user.id))){
        return NextResponse.json({ success: false, error: "Zugriff verweigert"}, { status: 403 });
       }

        return NextResponse.json({ success: true, data: result.group }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserID(req);
        const groupId = (await params).id as string;
        const result = await getGroup(groupId);
        if(result.error){
            return NextResponse.json({ success: false, error: result.error}, { status: result.status });
        }
        const group = result.group;

        if(group.creator.toString() !== user.id) {
            return NextResponse.json({ success: false, error: "Nicht berechtigt, diese Gruppe zu löschen" }, { status: 403 });
        }

        await Group.findByIdAndDelete(group._id);

        return NextResponse.json({ success: true, message: "Gruppe wurde gelöscht" }, { status: 200});
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/*
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const user = await getUserID(req);
        const groupId = (await params).id as string;
        const result = await getGroup(groupId);
        if(result.error){
            return NextResponse.json({ success: false, error: result.error}, { status: result.status });
        }
        const group = result.group;

        const { groupname, beschreibung, admins, members } = await req.json();

        if(group.creator.toString() !== user.id && !group.admins.includes(user.id)) {
            return NextResponse.json({ success: false, error: "Nicht berechtigt, diese Gruppe zu aktualisieren" }, { status: 403 });
        }

        if(groupname) group.groupname = groupname;
        if(beschreibung) group.beschreibung = beschreibung;
        if(admins && !group.admins.includes(admins)) group.admins.push(admins);
        if(members && !group.members.includes(members)) group.members.push(members);

        const updatedGroup = await group.save();

        return NextResponse.json({ success: true, data: updatedGroup }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
*/
