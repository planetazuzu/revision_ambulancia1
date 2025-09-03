import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

async function getAuthHeaders(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request);
    
    const response = await fetch(`${BACKEND_URL}/ambulances/${params.id}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Get ambulance API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request);
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/ambulances/${params.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Update ambulance API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const headers = await getAuthHeaders(request);
    
    const response = await fetch(`${BACKEND_URL}/ambulances/${params.id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json({ message: 'Ambulance deleted successfully' });
  } catch (error) {
    console.error('Delete ambulance API error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
