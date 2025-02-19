import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import Group from "@/lib/models/Group";
import User from "@/lib/models/User";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
    id: string;
    email: string;
    username: string;
}

async function getUserID(req: NextRequest) {
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

export async function GET(req: NextRequest) {
    try {
        
        const user = await getUserID(req);
        if(user.error){
            return NextResponse.json({ success: false, error: user.error}, { status: user.status });
        }

        const groups = await Group.find({
            $or: [{members: user.id}, { admins: user.id}]
        })
        .populate({
            path: "members",
            model: User,
            select: "vorname name benutzername _id"
        })
        .select("groupname beschreibung members") ;

        return NextResponse.json({ success: true, data: groups }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
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
}