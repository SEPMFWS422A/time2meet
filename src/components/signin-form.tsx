"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch("/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Ein Fehler ist aufgetreten.");
        setPassword("");
        return;
      }
      router.push("/");
    } catch {
      setError("Serverfehler. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <div className="w-full max-w-md" id="signInForm">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Anmelden</CardTitle>
            <CardDescription>
              Geben Sie Ihre daten ein, um sich in Ihrem time2meet Konto
              anzumelden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center"
            >
              Anmelden
            </button>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Du hast kein Konto?
          <Link className="underline ml-2" href="signup">
            Bei time2meet registrieren
          </Link>
        </div>
      </form>
    </div>
  );
}
