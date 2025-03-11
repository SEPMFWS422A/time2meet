import { NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";

// POST /api/user/[id]
export async function POST(request: Request) {
  await dbConnect();
  
  try {
    const formData = await request.formData();
    const userId = formData.get("userId")?.toString();
    const file = formData.get("profilbild") as File | null;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }
    if (!file) {
      return NextResponse.json(
        { success: false, error: "Fehlende Daten" },
        { status: 400 }
      );
    }

    if (file.size > 1 * 1024 * 1024) {
        return NextResponse.json(
            { success: false, error: "Maximale Dateigröße: 1MB" },
            { status: 400 }
          );
    }

    // Altes Bild löschen
    const existingUser = await User.findById(userId);
    if (existingUser?.profilbild) {
      try {
        const oldPath = join(process.cwd(), "public", existingUser.profilbild);
        await unlink(oldPath);
      } catch (error) {
        return NextResponse.json(
            { success: false, error: "Altes Bild konnte nicht gelöscht werden." },
            { status: 500 }
          );
      }
    }

    // Neues Bild speichern
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${userId}_${Date.now()}_${file.name}`;
    const path = join(process.cwd(), "public", "ProfilePicUploads", filename);
    
    await writeFile(path, buffer);
    const profilbildPath = `/ProfilePicUploads/${filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { profilbild: profilbildPath },
      { new: true }
    );

    return NextResponse.json({ success: true, data: user });
    
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}