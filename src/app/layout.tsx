"use client";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
export const metadata: Metadata = {
  title: "Time2Meet",
};
*/

function PreventBackNavigation() {
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = () => {
      const isUserLoggedIn = document.cookie.includes("token="); // Prüfen, ob der Benutzer eingeloggt ist

      if (!isUserLoggedIn) {
        // Verlauf komplett überschreiben, um die Zurück-Taste zu deaktivieren
        window.history.replaceState(null, "", "/login");
        window.history.pushState(null, "", "/login");

        const forceLoginPage = () => {
          window.history.replaceState(null, "", "/login");
          router.replace("/login");
          window.location.reload(); // Seite neu laden
        };

        window.addEventListener("popstate", forceLoginPage);

        return () => {
          window.removeEventListener("popstate", forceLoginPage);
        };
      }
    };

    if (!checkLoginStatus()) {
      const intervalId = setInterval(checkLoginStatus, 5000);
      return () => clearInterval(intervalId);
    }
  }, [router]);

  return null;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <PreventBackNavigation />
        {children}
      </body>
    </html>
  );
}
