"use client";
import React from "react";
import { Button, Navbar, NavbarContent, NavbarItem, User } from "@heroui/react";
import Link from "next/link";
import {
  ChevronDown,
  Home,
  List,
  MessageCircle,
  User as UserIcon,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function App() {
  const router = useRouter();

  const pathname = usePathname();

  // Navigation für Desktop (ohne "Gruppen & Freunde")
  const desktopNavlinks = [
    { href: "/", label: "Home", icon: <Home size={25} /> },
    { href: "/surveylist", label: "Umfragen", icon: <List size={25} /> },
    {
      href: "/messages",
      label: "Nachrichten",
      icon: <MessageCircle size={25} />,
    },
    {
      href: "/manageprofile",
      label: "Profil verwalten",
      icon: <UserIcon size={25} />,
    },
  ];

  // Navigation für Mobile (mit "Gruppen & Freunde")
  const mobileNavlinks = [
    { href: "/", label: "Home", icon: <Home size={25} /> },
    { href: "/friends", label: "Gruppen & Freunde", icon: <Users size={25} /> },
    { href: "/surveylist", label: "Umfragen", icon: <List size={25} /> },
    {
      href: "/messages",
      label: "Nachrichten",
      icon: <MessageCircle size={25} />,
    },
  ];

  async function logout() {
    try {
      await axios.get("/api/userauth/logout");
      toast.success("Erfolgreich abgemeldet.");
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
    }
  }

  return (
    <>
      <Navbar className="hidden md:flex bg-sky-950 w-screen text-black text-xl">
        <NavbarContent justify="center">
          {desktopNavlinks.map((link, i) => (
            <NavbarItem key={`${link.label}-${i}`}>
              <Link
                href={link.href}
                className={clsx(
                  "text-white hover:bg-sky-800 px-3 py-3 rounded-xl transition-all",
                  pathname === link.href && "bg-sky-800 font-bold shadow-lg"
                )}
              >
                {link.label}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>

        {/* Login (nur Desktop) */}
        <NavbarContent justify="end">
          <NavbarItem>
            <Link
              href="/login"
              className="text-white hover:bg-sky-800 px-3 py-3 rounded-xl transition-all"
              onClick={logout}
            >
              Logout
            </Link>
          </NavbarItem>
          <NavbarItem>

          </NavbarItem>
        </NavbarContent>
      </Navbar>

      <div className="md:hidden flex w-full border-b justify-center border-gray-200 ">
        <Button
          as={Link}
          href="/manageprofile"
          isIconOnly
          className="bg-transparent"
        >
          <User avatarProps={{ size: "sm" }} name="" />
        </Button>
        <Button className="bg-transparent">
          Username
          <ChevronDown />
        </Button>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-sky-950 border-t border-gray-700 md:hidden">
        <div className="flex justify-around p-2">
          {mobileNavlinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "flex flex-col items-center text-white hover:text-gray-300 text-xs",
                  isActive && "text-white" // Aktiver Link hat weißen Text
                )}
              >
                {/* Dynamisches Icon mit fill und stroke */}
                {React.cloneElement(link.icon, {
                  fill: isActive ? "white" : "none", // Fülle das Icon, wenn aktiv
                  stroke: isActive ? "white" : "currentColor", // Rahmenfarbe anpassen
                })}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
