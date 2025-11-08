import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Login is handled by NextAuth. Use /auth/signin." },
    { status: 404 }
  );
}
