import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/database/mongodb";

type User = {
  user_id: string;
  name: string;
  vorname: string;
  email: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("time2meet");

    if (req.method === "POST") {
      const { user_id, name, vorname, email }: User = req.body;
      if (!user_id || !name || !vorname || !email) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const collection = db.collection<User>("users");
      const result = await collection.insertOne({ user_id, name, vorname, email });

      return res.status(201).json({ message: "User added", id: result.insertedId });
    }

    if (req.method === "GET") {
      const collection = db.collection<User>("users");
      const users = await collection.find().toArray();
      return res.status(200).json(users);
    }

    res.setHeader("Allow", ["POST", "GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}