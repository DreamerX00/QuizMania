import { NextResponse } from 'next/server';

export async function GET(request: Request, context: any) {
  const { id } = await context.params;
  // TODO: Replace with real DB query if PremiumSummary table exists
  // For now, return mock data
  return NextResponse.json({
    templatesUsed: 5,
    quizPacks: 2,
    timeSaved: 12,
    dollarValue: 49.99,
    userId: id,
  });
} 