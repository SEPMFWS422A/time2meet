import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/user";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";

// const usersFilePath = path.join(process.cwd(), "src/lib/data/users.json");

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  await dbConnect();

  if (req.method === "POST") {
    const { username, email, password, password2 } = req.body;

    if (!username || !email || !password || !password2) {
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });
    }

    if (password !== password2) {
      return res
        .status(400)
        .json({ message: "Passwort stimmt nicht mit dem wiederholten Passwort überein" });
    }

    const userExists = await User.findOne({ email });
    if(userExists) {
      return res.status(400).json({ message: "Benutzer oder E-Mail existiert bereits." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ 
      email, 
      benutzername: username,
      password: hashedPassword,
    });

    return res.status(201).json({ message: "Benutzer erfolgreich registriert.", user: newUser });
  } else {
    return res.status(405).json({ message: "Methode nicht erlaubt." });
  }


  /*
  if (req.method === "POST") {
    const { username, email, password, password2 } = req.body;

    if (!username || !email || !password || !password2) {
      return res.status(400).json({ message: "Alle Felder sind erforderlich" });
    }

    if (password !== password2) {
      return res
        .status(400)
        .json({ message: "Passwort stimmt nicht mit dem wiederholten Passwort überein" });
    }

    try {
      const fileContent = fs.readFileSync(usersFilePath, "utf-8");
      const users = JSON.parse(fileContent);

      const userExists = users.some(
        (user: { username: string; email: string }) =>
          user.email === email || user.username === username
      );

      if (userExists) {
        return res.status(400).json({ message: "Benutzer oder E-Mail existiert bereits." });
      }

      const newUser = { username, email, password };
      users.push(newUser);

      fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), "utf-8");
      
      return res.status(201).json({ message: "Benutzer erfolgreich registriert." });
    } catch (error) {
      console.error("Fehler beim Schreiben oder Lesen der Datei:", error);
      return res.status(500).json({ message: "Serverfehler. Bitte versuchen Sie es später erneut." });
    }
  } else {
    return res.status(405).json({ message: "Methode nicht erlaubt." });
  }
  */
}
