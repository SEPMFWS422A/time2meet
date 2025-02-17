import type { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/user";
import jwt from "jsonwebtoken";

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
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
          return res.status(401).json({ success: false, error: "Unauthorized" });
        }

        if (!process.env.JWT_SECRET) {
          throw new Error("JWT_SECRET is not defined");
        }
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET);

        // Benutzerinformationen aus der Datenbank abrufen
        const user = await User.findById(decoded.id);
        if (!user) {
          return res.status(404).json({ success: false, error: "User not found" });
        }

        // Benutzerinformationen zurückgeben
        return res.status(200).json({ success: true, data: user });
      } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res
        .status(405)
        .json({ success: false, error: `Methode ${req.method} nicht erlaubt.` });
  }
}