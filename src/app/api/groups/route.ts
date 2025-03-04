import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getUserID, getGroup } from "@/lib/helper";

interface DecodedToken extends JwtPayload {
    id: string;
    email: string;
    username: string;
}

export async function GET(req: NextRequest) {
    await dbConnect();
    const user = await getUserID(req);
    if(user.error){
        return NextResponse.json({ success: false, error: user.error}, { status: user.status });
    }

    try {
        const userData = await User.findById(user.id).select("favouriteGroups");
        const favouriteGroups = userData?.favouriteGroups || [];


        const groups = await Group.find({
            $or: [{members: user.id}, { admins: user.id}],
        }).select("_id groupname beschreibung members").lean();

        const groupsWithFavStatus = groups.map((group: any) => ({
            ...group,
            isFavourite: favouriteGroups.some((favId: any) => favId.toString() === group._id.toString()),
        }));
        return NextResponse.json({ success: true, data: groupsWithFavStatus }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    const user = await getUserID(req);
    if(user.error){
        return NextResponse.json({ success: false, error: user.error}, { status: user.status });
    }
    try {
        const { groupname, beschreibung } = await req.json();
        if(!groupname) {
            return NextResponse.json({ success: false, error: "Groupname ist erforderlich."}, { status: 400 });
        }

        const newGroup = new Group({
            groupname,
            beschreibung: beschreibung || "",
            creator: user.id,
            admins: [user.id],
            members: [user.id],
        });

        await newGroup.save();
        return NextResponse.json({ success: true, data: newGroup }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        
    }
    /*
    try {
        const user = await getUserID(req);
        if(user.error){
            return NextResponse.json({ success: false, error: user.error}, { status: user.status });
        }
        
        const {groupname, beschreibung, admins, members } = await req.json();

        if(!groupname) {
            return NextResponse.json({ success: false, error: "Groupname ist erforderlich."}, { status: 400 });
        }

        const newGroup = await Group.create({
            groupname,
            beschreibung,
            creator: user.id,
            admins: admins? [...admins, user.id] : [user.id],
            members: members? [...members, user.id] : [user.id],
        });

        return NextResponse.json({ success: true, data: newGroup }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
        */
}