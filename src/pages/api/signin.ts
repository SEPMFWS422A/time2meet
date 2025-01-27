import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

const usersFilePath = path.join(process.cwd(), "src/lib/data/users.json");

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "E-Mail und Passwort sind erforderlich." });
    }

    try {
      const fileContent = fs.readFileSync(usersFilePath, "utf-8");
      const users = JSON.parse(fileContent);

      const user = users.find(
        (user: { email: string; password: string }) =>
          user.email === email && user.password === password
      );

      if (!user) {
        return res.status(401).json({ message: "Ungültige Anmeldedaten." });
      }

      res.status(200).json({
        message: "Erfolgreich angemeldet.",
        user: { email: user.email, username: user.username },
      });
    } catch (error) {
      console.error("Fehler beim Zugriff auf users.json:", error);
      return res.status(500).json({ message: "Serverfehler. Bitte versuchen Sie es später erneut." });
    }
  } else {
    return res.status(405).json({ message: "Methode nicht erlaubt." });
  }
}
