import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";

export async function DELETE(request: Request) {
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
    
    // Entferne den Freund aus der Liste des aktuellen Users
    await User.findByIdAndUpdate(
      currentUserId,
      { $pull: { freunde: { friendId } } }
    );
    
    // Optional: Entferne den aktuellen User auch aus der Freundesliste des Freundes
    await User.findByIdAndUpdate(
      friendId,
      { $pull: { freunde: { friendId: currentUserId } } }
    );
    
    return NextResponse.json({
      success: true,
      message: "Freund erfolgreich entfernt"
    });
    
  } catch (error: any) {
    console.error("Fehler beim Entfernen eines Freundes:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Server-Fehler beim Entfernen des Freundes" },
      { status: 500 }
    );
  }
}