import { NextRequest, NextResponse } from 'next/server';
import { RazorpayService } from '@/services/razorpayService';

export async function GET(request: NextRequest) {
  try {
    const testMode = RazorpayService.isTestMode();
    const testCards = RazorpayService.getTestCards();
    
    return NextResponse.json({
      success: true,
      testMode: testMode,
      testCards: testCards,
      environment: process.env.NODE_ENV,
      keyId: process.env.RAZORPAY_KEY_ID ? 
        (process.env.RAZORPAY_KEY_ID.includes('rzp_test_') ? 'Test Key' : 'Live Key') : 
        'No Key Found',
      message: testMode ? 
        'Running in test mode - use test cards for payment testing' : 
        'Running in live mode - real payments will be processed'
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json(
      { error: 'Failed to get test information' },
      { status: 500 }
    );
  }
} 