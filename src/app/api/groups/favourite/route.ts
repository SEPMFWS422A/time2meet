import dbConnect from "@/lib/database/dbConnect";
import { getUserID } from "@/lib/helper";
import User from "@/lib/models/User";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    await dbConnect();
    const user = await getUserID(req);
    if(user.error){
        return NextResponse.json({ success: false, error: user.error}, { status: user.status });
    }

    try {
        const {groupId} = await req.json();
        if(!groupId) {
            return NextResponse.json({ success: false, error: "Gruppen ID fehlt"}, { status: 400 });
        }

        const userdata = await User.findById(user.id);
        if(!userdata){
            return NextResponse.json({ success: false, error: "Benutzer nicht gefunden"}, { status: 404 });
        }

        const isFavourite = userdata.favouriteGroups.includes(groupId);
        if(isFavourite){
            userdata.favouriteGroups = userdata.favouriteGroups.filter((id: any) => id.toString() !== groupId);
        } else {
            userdata.favouriteGroups.push(groupId);
        }
        await userdata.save();
        return NextResponse.json({ success: true, isFavourite: !isFavourite }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        
    }
}