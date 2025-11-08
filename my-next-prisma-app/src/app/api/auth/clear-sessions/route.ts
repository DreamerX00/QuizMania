import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * Emergency route to clear all NextAuth cookies
 * Visit /api/auth/clear-sessions to clear your session cookies
 */
export async function GET() {
  const cookieStore = await cookies();

  // Delete all NextAuth-related cookies
  const cookieNames = [
    "next-auth.session-token",
    "next-auth.csrf-token",
    "next-auth.callback-url",
    "__Secure-next-auth.session-token",
    "__Host-next-auth.csrf-token",
  ];

  cookieNames.forEach((name) => {
    cookieStore.delete(name);
  });

  return NextResponse.json(
    {
      success: true,
      message: "All session cookies cleared. Please sign in again.",
      redirect: "/auth/signin",
    },
    {
      headers: {
        "Set-Cookie": cookieNames
          .map(
            (name) =>
              `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax`
          )
          .join(", "),
      },
    }
  );
}
