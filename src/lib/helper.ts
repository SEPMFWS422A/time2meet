import dbConnect from "./database/dbConnect";
import Group from "./models/Group";
import jwt, { JwtPayload } from "jsonwebtoken";
import { NextRequest } from "next/server";

interface DecodedToken extends JwtPayload {
    id : string;
  }

  
  export async function getUserID(req: NextRequest) {
    await dbConnect();
    const token = req.cookies.get("token")?.value;
    if(!token){
      return { error: "Nicht authentifiziert", status: 401 };
    }
    try {
      const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET!) as DecodedToken;
      return { id: decodedToken.id };
    } catch (error) {
      return { error: "Ungültiges Token",  status: 403 };
    }
  }
  
  
  export async function getGroup(groupId: string) {
    await dbConnect();
    const group = await Group.findById(groupId);
    if(!group){
      return { error: "Gruppe nicht gefunden", status: 404};
    }
    return group;
  }