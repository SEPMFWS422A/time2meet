import type {Metadata} from "next";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
    title: "Time2Meet",
};

export default function Layout({children}: Readonly<{ children: React.ReactNode }>) {
    return (
        <div>
            <div>
                <Navbar/>
            </div>
            <div className="flex flex-col w-full">{children}</div>
        </div>
    );
}
