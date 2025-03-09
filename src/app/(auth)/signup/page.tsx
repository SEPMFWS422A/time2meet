'use client';

import {useEffect, useState} from "react";
import Link from "next/link";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import axios from "axios";
import toast, {Toaster} from "react-hot-toast";

export default function SignUpForm() {
    const router = useRouter();

    // Benutzerzustand
    const [user, setUser] = useState({
        username: "",
        email: "",
        password: "",
        password2: "",
    });

    // UI-Status
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    // Button aktivieren/deaktivieren
    useEffect(() => {
        if (
            user.username.length > 0 &&
            user.email.length > 0 &&
            user.password.length > 0 &&
            user.password2.length > 0
        ) {
            setButtonDisabled(false);
        } else {
            setButtonDisabled(true);
        }
    }, [user]);

    // Registrierungs-Handler
    const onSignup = async () => {
        if (user.password !== user.password2) {
            toast.error("Passwörter stimmen nicht überein!");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post("/api/userauth/signup", {
                username: user.username,
                email: user.email,
                password: user.password,
            });

            toast.success(response.data.message);

            // Verzögerung von 3 Sekunden, dann Weiterleitung zur Login-Seite
            setTimeout(() => {
                router.push("/login");
            }, 1000);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Ein Fehler ist aufgetreten.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-1 md:mx-0 w-full max-w-md" id="signUpForm">
            <Toaster position="top-right" reverseOrder={false}/>

            {/* Card */}
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold">
                        {loading ? "Verarbeite..." : "Registrieren"}
                    </CardTitle>
                    <CardDescription>Erstelle ein neues Konto</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Benutzername</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="username"
                            value={user.username}
                            onChange={(e) => setUser({...user, username: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="email@example.com"
                            value={user.email}
                            onChange={(e) => setUser({...user, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Passwort</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="********"
                            value={user.password}
                            onChange={(e) => setUser({...user, password: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password2">Passwort wiederholen</Label>
                        <Input
                            id="password2"
                            type="password"
                            placeholder="********"
                            value={user.password2}
                            onChange={(e) => setUser({...user, password2: e.target.value})}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <button
                        type="button"
                        onClick={onSignup}
                        disabled={buttonDisabled}
                        className={`text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center ${
                            buttonDisabled ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "Verarbeite..." : "Registrieren"}
                    </button>
                </CardFooter>
            </Card>

            {/* Login-Link */}
            <div className="mt-4 text-center text-sm">
                <Link className="underline text-blue-600" href="/login">
                    Hast du bereits ein Konto? Hier anmelden
                </Link>
            </div>
        </div>
    );
}
