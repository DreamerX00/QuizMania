import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request, { params }: { params: Promise<{ quizId: string }> }) {
  const { quizId } = await params;
  
  if (!quizId) {
    return NextResponse.json({ error: 'Quiz ID is required' }, { status: 400 });
  }

  try {
    const { isOfficial, published } = await request.json();
    
    let updatedRecord;

    if (typeof isOfficial === 'boolean') {
      // Admin is making a template official
      updatedRecord = await prisma.template.update({
        where: { quizId },
        data: { isOfficial },
      });
    } else if (typeof published === 'boolean') {
      // Any user is publishing their quiz to the Explore page
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
}

export async function DELETE(request: Request, { params }: { params: Promise<{ quizId: string }> }) {
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
} 