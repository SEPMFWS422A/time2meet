import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/user";

type Data =
  | { success: boolean; data?: any }
  | { success: boolean; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const users = await User.find({});
        return res.status(200).json({ success: true, data: users });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }

    case "POST":
      try {
        const user = new User(req.body);
        await user.save();
        return res.status(201).json({ success: true, data: user });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "POST"]);
      return res
        .status(405)
        .json({ success: false, error: `Methode ${req.method} nicht erlaubt.` });
  }
}