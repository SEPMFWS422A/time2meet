import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import axios from "axios";
import mongoose from "mongoose";

// Hilfsfunktion zum Abrufen des aktuellen Users
async function getCurrentUser(request: Request) {
  try {
    // Cookie extrahieren
    const cookieHeader = request.headers.get("cookie");
    if (!cookieHeader) {
      throw new Error("Keine Authentifizierung vorhanden");
    }

    // GET-Request an /api/userauth/decode mit dem Cookie
    const response = await fetch("http://localhost:3000/api/userauth/decode", {
      headers: { cookie: cookieHeader }
    });

    if (!response.ok) {
      throw new Error("Authentifizierungsfehler");
    }

    const data = await response.json();
    if (!data.id) {
      throw new Error("Keine Benutzer-ID gefunden");
    }

    // User mit der ID finden
    const user = await User.findById(data.id);
    if (!user) {
      throw new Error("Benutzer nicht gefunden");
    }

    return user;
  } catch (error) {
    throw error;
  }
}

// GET /api/friends - Liste aller Freunde des aktuellen Users
export async function GET(request: Request) {
  await dbConnect();
  try {
    // Benutzer anhand des JWT-Tokens identifizieren
    const currentUser = await getCurrentUser(request);

    // Freunde abrufen (Rest bleibt unverändert)
    if (!currentUser.freunde || currentUser.freunde.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Du hast keine Freunde!"
      });
    }

    const friendIds = currentUser.freunde.map((item: any) => item.friendId);
    const friends = await User.find(
      { _id: { $in: friendIds } },
      { vorname: 1, name: 1, benutzername: 1, profilbild: 1 }
    );

    // Favoritenstatus hinzufügen
    const favoriteMap = new Map(
      currentUser.freunde.map((item: any) => [
        item.friendId.toString(),
        item.favourite
      ])
    );
    
    const friendsWithFav = friends.map((friend) => ({
      ...friend.toObject(),
      isFavourite: favoriteMap.get(friend._id.toString()) || 0
    }));

    return NextResponse.json({ success: true, data: friendsWithFav });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/friends - Freund direkt hinzufügen
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