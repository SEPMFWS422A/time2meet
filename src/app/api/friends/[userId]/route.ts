import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import mongoose from "mongoose";

// GET /api/friends/[userId]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  await dbConnect();
  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.freunde || user.freunde.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Du hast keine Freunde!"
      });
    }

    const friendIds = user.freunde.map((item: any) => item.friendId);

    const friends = await User.find(
      { _id: { $in: friendIds } },
      { vorname: 1, name: 1, benutzername: 1, profilbild: 1 }
    );

    const favoriteMap = new Map(
      user.freunde.map((item: any) => [item.friendId.toString(), item.favourite])
    );
    const friendsWithFav = friends.map((friend) => ({
      ...friend.toObject(),
      isFavourite: favoriteMap.get(friend._id.toString()) || 0
    }));

    return NextResponse.json({ success: true, data: friendsWithFav });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/friends/[userId]
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ userId: string }> }
  ) {
    const { userId } = await params;
    await dbConnect();
    try {
      const { friendId, favourite } = await request.json();
      const friendObjectId = new mongoose.Types.ObjectId(friendId);
      const userObjectId = new mongoose.Types.ObjectId(userId);
  
      let updatedUser = await User.findOneAndUpdate(
        { _id: userObjectId, "freunde.friendId": friendObjectId },
        { $set: { "freunde.$.favourite": favourite ? 1 : 0 } },
        { new: true }
      );
  
      if (!updatedUser) {
        updatedUser = await User.findByIdAndUpdate(
          userObjectId,
          {
            $push: { freunde: { friendId: friendObjectId, favourite: favourite ? 1 : 0 } }
          },
          { new: true }
        );
        if (!updatedUser) {
          return NextResponse.json(
            { success: false, error: "User nicht gefunden." },
            { status: 404 }
          );
        }
      }
  
      return NextResponse.json({ success: true, data: updatedUser });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  }