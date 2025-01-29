"use client";
import React from "react";
import {
    Navbar,
    NavbarContent,
    NavbarItem,
    Button,
} from "@heroui/react";
import Link from "next/link";



export default function App() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);


    return (
        <Navbar className="bg-sky-950 text-white text-xl" isBordered isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen} id ="navbar" >

            <NavbarContent  justify="center" >

                <NavbarItem isActive>
                    <Link aria-current="page" href="/" className= "text-white text-xl"  >
                        Home
                    </Link>
                </NavbarItem>
                <NavbarItem isActive>
                    <Link aria-current="page" href="/surveylist"  className= "text-white text-xl" >
                        Umfragen
                    </Link>
                </NavbarItem>
                <NavbarItem isActive>
                    <Link aria-current="page" href="/messages"  className= "text-white text-xl" >
                        Nachrichten
                    </Link>
                </NavbarItem>
                <NavbarItem isActive>
                    <Link aria-current="page" href="/manageprofile"  className= "text-white text-xl" >
                        Profil verwalten
                    </Link>
                </NavbarItem>
            </NavbarContent>

            <NavbarContent justify="end">
                <NavbarItem className="hidden lg:flex">
                    <Link href="/signin"  className= "text-white">Login</Link>
                </NavbarItem>
                <NavbarItem>
                    <Button className= "text-white" as={Link} color="warning" href="/signup" variant="flat">
                        Sign Up
                    </Button>
                </NavbarItem>
            </NavbarContent>

        </Navbar>
    );
}

