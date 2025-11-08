import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Registration is handled by NextAuth. Use /auth/signin." },
    { status: 404 }
  );
}
