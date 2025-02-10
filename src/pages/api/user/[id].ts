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

  const { id } = req.query;

  switch (req.method) {
    case "GET":
      try {
        const user = await User.findById(id);
        if (!user) {
          return res.status(404).json({ success: false, error: "Benutzer nicht gefunden." });
        }
        return res.status(200).json({ success: true, data: user });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }

    case "PUT":
      try {
        const user = await User.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!user) {
          return res.status(404).json({ success: false, error: "Benutzer nicht gefunden." });
        }
        return res.status(200).json({ success: true, data: user });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }

    case "DELETE":
      try {
        const deletedUser = await User.findByIdAndDelete(id);
        if (!deletedUser) {
          return res.status(404).json({ success: false, error: "Benutzer nicht gefunden." });
        }
        return res.status(200).json({ success: true, data: deletedUser });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
      return res
        .status(405)
        .json({ success: false, error: `Methode ${req.method} nicht erlaubt.` });
  }
}