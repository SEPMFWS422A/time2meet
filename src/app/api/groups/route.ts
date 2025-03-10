import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import { getUserID } from "@/lib/helper";


export async function GET(req: NextRequest) {
    await dbConnect();
    const user = await getUserID(req);

    if(user.error){
        return NextResponse.json({ success: false, error: user.error}, { status: user.status });
    }

    try {
        const userData = await User.findById(user.id).select("favouriteGroups");
        const favouriteGroups = userData?.favouriteGroups.map((id: any) => id.toString()) || [];

        const groups = (await Group.find({
            $or: [{members: user.id}, { admins: user.id}],
        }).select("_id groupname beschreibung members").lean()) || [];

        const groupsWithFavStatus = groups.map((group: any) => ({
            ...group,
            isFavourite: favouriteGroups.includes(group._id.toString()),
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

        

        const savedGroup = await newGroup.save();
        return NextResponse.json({ success: true, data: savedGroup }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        
    }
}