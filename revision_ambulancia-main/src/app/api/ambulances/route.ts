import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function getAuthHeaders(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function GET(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    
    const response = await fetch(`${BACKEND_URL}/ambulances`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get ambulances API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const headers = await getAuthHeaders(request);
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/ambulances`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Create ambulance API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
