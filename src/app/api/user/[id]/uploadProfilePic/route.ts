import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";

// POST /api/user/[id]/uploadProfilePic
export async function POST(request: Request) {
  await dbConnect();

  try {
    const { userId, image } = await request.json(); 

    if (!userId || !image) {
      return NextResponse.json(
        { success: false, error: "Fehlende Daten" },
        { status: 400 }
      );
    }

    const base64Length = image.length - "data:image/png;base64,".length;
    const sizeInBytes = 4 * Math.ceil(base64Length / 3) * 0.5624896334383812;
    if (sizeInBytes > 1 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Maximale Dateigröße: 1MB" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profilbild: image }, 
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