import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('authToken')?.value;
    
    if (token) {
      // Call backend logout endpoint
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }

    // Clear the cookie
    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete('authToken');
    
    return response;
  } catch (error) {
    console.error('Logout API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
