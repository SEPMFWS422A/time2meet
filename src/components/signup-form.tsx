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

export function SignUpForm() {
  return (
    <div className="w-full max-w-md">
      <form>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold">Registrieren</CardTitle>
            <CardDescription>Erstelle ein neues Konto</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="passwort"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password2">Passwort wiederholen</Label>
              <Input
                id="password2"
                name="password2"
                type="password"
                placeholder="passwort wiederholen"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <button className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
              Registrieren
            </button>
          </CardFooter>
        </Card>
        <div className="mt-4 text-center text-sm">
          Du hast bereits ein Konto?
          <Link className="underline ml-2" href="signin">
            Melde dich hier an
          </Link>
        </div>
      </form>
    </div>
  );
}
