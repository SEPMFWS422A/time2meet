"use client";

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

export function SignInForm() {
  return (
    <div className="w-full max-w-md" id="signInForm">
      <form>
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
                id="identifier"
                name="identifier"
                type="text"
                placeholder="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Anmelden
            </button>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Du hast kein konto?
          <Link className="underline ml-2" href="signup" id="gotosignup">
            Bei time2meet registrieren
          </Link>
        </div>
      </form>
    </div>
  );
}
