import { NextRequest, NextResponse } from 'next/server'
// import prisma from '@/lib/prisma'
import { PrismaClient } from '@prisma/client'
import { Role } from '@/types/auth'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST() {
  return NextResponse.json({ error: 'Login is handled by Clerk. Use Clerk sign in.' }, { status: 404 })
} 