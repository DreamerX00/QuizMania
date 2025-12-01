/**
 * CSRF Token API Route
 * GET /api/csrf
 * Returns CSRF token for client-side requests
 */

import { NextResponse } from "next/server";
import { generateCsrfToken, setCsrfCookie } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = generateCsrfToken();
  const response = NextResponse.json({ token });

  setCsrfCookie(response, token);

  return response;
}
