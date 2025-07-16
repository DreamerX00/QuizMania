import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const prisma = new PrismaClient();

const reportSchema = z.object({
  description: z.string().min(1).max(2000),
});

export const POST = withValidation(reportSchema, async (req: any) => {
  try {
    const { description } = req.validated;
    const report = await prisma.reports.create({
      data: {
        description,
        status: 'New',
      },
    });
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}); 