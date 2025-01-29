import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/database/mongodb";

type User = {
  name: string;
  age: number;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = await clientPromise;
    const db = client.db("TimetoMeet");

    if (req.method === "POST") {
      const { name, age }: User = req.body;
      if (!name || !age) {
        return res.status(400).json({ error: "Name and age are required" });
      }

      const collection = db.collection<User>("users");
      const result = await collection.insertOne({ name, age });

      return res.status(201).json({ message: "User added", id: result.insertedId });
    }

    if (req.method === "GET") {
      const users = await db.collection<User>("users").find().toArray();
      return res.status(200).json(users);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
}