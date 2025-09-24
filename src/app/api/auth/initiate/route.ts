import { NextRequest, NextResponse } from 'next/server';

// This is a proxy to the backend API for Vercel deployment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // In production, this would proxy to your backend
    // For now, we'll simulate the response
    const response = {
      success: true,
      sessionId: `session-${Date.now()}`,
      message: 'OTP sent successfully'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Internal server error' } },
      { status: 500 }
    );
  }
}