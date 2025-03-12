'use client';

import React, {useEffect, useState} from "react";
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Navbar,
    NavbarContent,
    NavbarItem,
    User
} from "@heroui/react";
import Link from "next/link";
import {ChevronDown, Home, List, MessageCircle, User as UserIcon, Users,} from "lucide-react";
import {usePathname} from "next/navigation";
import {clsx} from "clsx";
import toast from "react-hot-toast";
import axios from "axios";

interface UserData {
    vorname: string;
    name: string;
    benutzername: string;
    email: string;
    telefonnummer: string;
    geburtsdatum: string;
    profilsichtbarkeit: string;
    kalendersichtbarkeit: string;
    theme: string;
}

export default function App() {
    const [userId, setUserId] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData>({
        vorname: "",
        name: "",
        benutzername: "",
        email: "",
        telefonnummer: "",
        geburtsdatum: "",
        profilsichtbarkeit: "Öffentlich",
        kalendersichtbarkeit: "Öffentlich",
        theme: "Hell"
    });
    const pathname = usePathname();

    useEffect(() => {
        const decodeToken = async () => {
            try {
                const res = await fetch("/api/userauth/decode", {
                    credentials: "include"
                });
                const data = await res.json();
                if (data.id) {
                    setUserId(data.id);
                } else {
                    console.error("Token not found on server:", data);
                }
            } catch (error) {
                console.error("Error decoding token:", error);
            }
        };
        decodeToken();
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(`/api/user/${userId}`, {
                    withCredentials: true
                });
                setUserData(res.data.data);
            } catch (error) {
                console.error("Fehler beim Abrufen der Benutzerdaten:", error);
            }
        };
        fetchUserData();
    }, [userId]);

    // Navigation für Desktop (ohne "Gruppen & Freunde")
    const desktopNavlinks = [
        {href: "/", label: "Home", icon: <Home size={25}/>},
        {href: "/surveylist", label: "Umfragen", icon: <List size={25}/>},
        {
            href: "/messages",
            label: "Nachrichten",
            icon: <MessageCircle size={25}/>,
            id: "nachrichten"
        },
        {
            href: "/manageprofile",
            label: "Profil verwalten",
            icon: <UserIcon size={25}/>,
            id: "profil-verwalten",
        },
    ];

    // Navigation für Mobile (mit "Gruppen & Freunde")
    const mobileNavlinks = [
        {href: "/", label: "Home", icon: <Home size={25}/>},
        {href: "/friends", label: "Gruppen & Freunde", icon: <Users size={25}/>},
        {href: "/surveylist", label: "Umfragen", icon: <List size={25}/>},
        {
            href: "/messages",
            label: "Nachrichten",
            icon: <MessageCircle size={25}/>,
        },
    ];

    async function logout() {
        try {
            await axios.get("/api/userauth/logout");
            toast.success("Erfolgreich abgemeldet.");
            if (typeof window !== "undefined") {
                sessionStorage.clear();
                localStorage.clear();
            }
            window.location.href = "/login";

            setTimeout(() => {
                window.history.pushState(null, "", "/login");
            }, 100);

            //router.push("/login");
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
                                id={link.id}
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
                    <NavbarItem></NavbarItem>
                </NavbarContent>
            </Navbar>

            <div className="md:hidden flex w-full border-b justify-center border-gray-200 ">
                <Button
                    as={Link}
                    href="/manageprofile"
                    isIconOnly
                    className="bg-transparent"
                >
                    <User avatarProps={{size: "sm"}} name=""/>
                </Button>
                <Dropdown>
                    <DropdownTrigger>
                        <Button className="bg-transparent">
                            {userData.benutzername ?? `${userData.vorname} ${userData.name}`}
                            <ChevronDown/>
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu variant="bordered" aria-label="Static Actions">
                        <DropdownItem key="logout" onPress={logout}>Logout</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
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
