import { NextRequest, NextResponse } from 'next/server';
import { reviewsService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ambulanceId = searchParams.get('ambulanceId');
    
    const logs = await reviewsService.getCleaningLogs(ambulanceId || undefined);
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newLog = await reviewsService.createCleaningLog(body);
    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
