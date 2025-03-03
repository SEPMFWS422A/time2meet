import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    
    if (query.length < 2) {
      return NextResponse.json({ 
        success: false, 
        error: "Suchbegriff muss mindestens 2 Zeichen lang sein" 
      }, { status: 400 });
    }

    // Hole den aktuellen Benutzer anhand des Tokens
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, error: "Nicht authentifiziert" }, 
        { status: 401 }
      );
    }
    
    // Rufe decode-API auf für Authentifizierung
    const response = await fetch("http://localhost:3000/api/userauth/decode", {
      headers: { cookie: cookieHeader }
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "Authentifizierungsfehler" },
        { status: 401 }
      );
    }
    
    const data = await response.json();
    const currentUserId = data.id;
    
    if (!currentUserId) {
      return NextResponse.json(
        { success: false, error: "Keine Benutzer-ID gefunden" },
        { status: 401 }
      );
    }
    
    // Hole den aktuellen User mit seiner Freundesliste
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Aktueller Benutzer nicht gefunden" },
        { status: 404 }
      );
    }
    
    

    const friendIds: string[] = currentUser.freunde?.map((friend: any) => friend.friendId.toString()) || [];
    
    // Suche nach allen Benutzern, die dem Suchbegriff entsprechen
    const results = await User.find({
      $or: [
        { vorname: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
        { benutzername: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("_id vorname name benutzername email profilbild").limit(10);

    // Füge zusätzliche Informationen für jeden Benutzer hinzu
    const resultsWithStatus = results.map(user => {
      const isCurrentUser = user._id.toString() === currentUserId;
      const isFriend = friendIds.includes(user._id.toString());
      
      return {
        ...user.toObject(),
        isCurrentUser,
        isFriend
      };
    });

    return NextResponse.json({ success: true, data: resultsWithStatus });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}