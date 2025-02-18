import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    const ispublic = path === "/login" || path === "/signup";

    const token = req.cookies.get("token")?.value || "";

    if(ispublic && token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if(!ispublic && !token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: ["/", "/login", "/signup", "/friends", "/groupdetails", "/manageprofile", "/messages", "/surveylist" ]
}