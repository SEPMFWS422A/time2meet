import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import mongoose from "mongoose";

// POST /api/friends/add
export async function POST(request: Request) {
  await dbConnect();
  try {
    const { friendId } = await request.json();
    
    // Cookie extrahieren und decode-API aufrufen für Authentifizierung
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      return NextResponse.json(
        { success: false, error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }
    
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
    
    // User-Objekte validieren
    const currentUser = await User.findById(currentUserId);
    const friendUser = await User.findById(friendId);
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Aktueller Benutzer nicht gefunden" },
        { status: 404 }
      );
    }
    
    if (!friendUser) {
      return NextResponse.json(
        { success: false, error: "Freund nicht gefunden" },
        { status: 404 }
      );
    }
    
    // Prüfen, ob der Freund bereits hinzugefügt wurde
    const alreadyFriend = currentUser.freunde?.some(
      (f: any) => f.friendId.toString() === friendId
    );
    
    if (alreadyFriend) {
      return NextResponse.json(
        { success: false, error: "Dieser Benutzer ist bereits dein Freund" },
        { status: 400 }
      );
    }
    
    // Freundschaft in beide Richtungen hinzufügen
    const friendObjectId = new mongoose.Types.ObjectId(friendId);
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    
    // Current user -> Friend
    await User.findByIdAndUpdate(
      currentUserId,
      { $push: { freunde: { friendId: friendObjectId, favourite: 0 } } }
    );
    
    // Friend -> Current user (optional - für beidseitige Freundschaft)
    await User.findByIdAndUpdate(
      friendId,
      { $push: { freunde: { friendId: currentUserObjectId, favourite: 0 } } }
    );
    
    return NextResponse.json({
      success: true,
      message: "Freund erfolgreich hinzugefügt"
    });
    
  } catch (error: any) {
    console.error("Fehler beim Hinzufügen eines Freundes:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server-Fehler beim Hinzufügen des Freundes" },
      { status: 500 }
    );
  }
}