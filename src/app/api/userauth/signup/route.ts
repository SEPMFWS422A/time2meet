import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/dbConnect";
import User from "@/lib/models/User";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const reqBody = await request.json();
        const { username, email, password } = reqBody;

        console.log(reqBody);

        // Prüfen, ob alle Felder ausgefüllt sind
        if (!username || !email || !password) {
            return NextResponse.json({ error: "Alle Felder sind erforderlich." }, { status: 400 });
        }

        // Prüfen, ob der Benutzer bereits existiert
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "Benutzer existiert bereits." }, { status: 400 });
        }

        // Passwort hashen
        const hashedPassword = await bcrypt.hash(password, 10);

        // Neuen Benutzer erstellen
        const newUser = await User.create({ 
              email, 
              benutzername: username,
              password: hashedPassword,
            });



        return NextResponse.json({
            message: "Benutzer erfolgreich registriert.",
            success: true,
            user: newUser,
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
