import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { withValidation } from '@/utils/validation';

const prisma = new PrismaClient();

const quizIdParamSchema = z.object({ quizId: z.string().min(1) });
const updateTemplateSchema = z.object({
  isOfficial: z.boolean().optional(),
  published: z.boolean().optional(),
});

export const PUT = withValidation(updateTemplateSchema, async (request: any, { params }: { params: Promise<{ quizId: string }> }) => {
  const { quizId } = await params;
  if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
  }
  try {
    const { isOfficial, published } = request.validated;
    let updatedRecord;
    if (typeof isOfficial === 'boolean') {
      updatedRecord = await prisma.template.update({
        where: { quizId },
        data: { isOfficial },
      });
    } else if (typeof published === 'boolean') {
      updatedRecord = await prisma.quiz.update({
        where: { id: quizId },
        data: { published },
      });
    } else {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error(`Error updating record for quiz ${quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    );
  }
});

export const DELETE = withValidation(quizIdParamSchema, async (request: any, { params }: { params: Promise<{ quizId: string }> }) => {
  const { quizId } = await params;
  if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
  }
  try {
    await prisma.template.delete({
      where: { quizId },
    });
    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error(`Error deleting template ${quizId}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}); 