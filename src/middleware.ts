import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    const ispublic = path === "/login" || path === "/signup";

    const token = req.cookies.get("token")?.value;

    if(ispublic && token) {
        return NextResponse.redirect(new URL("/", req.url));
    }

    if(!ispublic && !token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const response = NextResponse.next();

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    return response;
}

export const config = {
    matcher: ["/", "/login", "/signup", "/friends", "/groupdetails", "/manageprofile", "/messages", "/surveylist" ]
}