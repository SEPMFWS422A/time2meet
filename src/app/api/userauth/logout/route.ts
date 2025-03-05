import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    try {
        const response = NextResponse.json({
            Message: "Logout successful",
            success: true
        });

        response.cookies.delete('token');

        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
