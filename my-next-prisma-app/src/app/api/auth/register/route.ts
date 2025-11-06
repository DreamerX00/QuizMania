import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Role } from "@/types/auth";
import { Role as PrismaRole } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function POST() {
  return NextResponse.json(
    { error: "Registration is handled by Clerk. Use Clerk sign up." },
    { status: 404 }
  );
}
