import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Kein Token bereitgestellt" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!);
    return NextResponse.json(decoded);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}