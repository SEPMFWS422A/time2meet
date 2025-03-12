'use client';

import {useEffect, useState} from "react";
import Link from "next/link";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {useRouter} from "next/navigation";
import toast, {Toaster} from "react-hot-toast";
import login from "@/lib/api_methods/userauth/login";

export default function SignInForm() {
    const router = useRouter();

    // Benutzerzustand für Login-Daten
    const [user, setUser] = useState({
        email: "",
        password: "",
    });

    // UI-Status
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [processing, setProcessing] = useState(false);

    // Button aktivieren/deaktivieren, wenn sich der Benutzerstatus ändert
    useEffect(() => {
        setButtonDisabled(!(user.email.length > 0 && user.password.length > 0));
    }, [user]);

    // Login-Handler
    const onLogin = async () => {
        setProcessing(true);
        const loginMessage = await login(user);
        console.log(loginMessage)
        if (loginMessage) {
            console.log("in IF", loginMessage);

            toast.success(loginMessage);
            router.push("/");
        } else {
            console.log("IN ELSE", loginMessage);
            setProcessing(false);
        }
    };

    return (
        <div className="mx-1 md:mx-0 w-full max-w-md" id="signInForm">
            <Toaster position="top-right" reverseOrder={false}/>

            {/* Card */}
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-bold">
                        {processing ? "Processing..." : "Anmelden"}
                    </CardTitle>
                    <CardDescription className="text-base">
                        Geben Sie Ihre Daten ein, um sich in Ihrem time2meet-Konto
                        anzumelden.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-base" htmlFor="email">
                            Email
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@example.com"
                            value={user.email}
                            onChange={(e) => setUser({...user, email: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-base" htmlFor="password">
                            Passwort
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="********"
                            value={user.password}
                            onChange={(e) => setUser({...user, password: e.target.value})}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                    <button
                        type="button"
                        onClick={onLogin}
                        disabled={buttonDisabled || processing}
                        className={`text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center ${
                            buttonDisabled || processing
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                        }`}
                    >
                        {processing ? "Processing..." : "Anmelden"}
                    </button>
                </CardFooter>
            </Card>

            {/* Links */}
            <div className="mt-4 text-center text-sm">
                <Link href="/forgetpassword" className="underline text-blue-600">
                    Passwort vergessen?
                </Link>
                <br/>
                <span>Du hast kein Konto?</span>
                <Link className="underline ml-2 text-blue-600" href="/signup">
                    Bei time2meet registrieren
                </Link>
            </div>
        </div>
    );
}
