import { NextRequest, NextResponse } from 'next/server';
import { reviewsService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ambulanceId = searchParams.get('ambulanceId');
    
    const checks = await reviewsService.getDailyChecks(ambulanceId || undefined);
    return NextResponse.json({ success: true, data: checks });
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
    const newCheck = await reviewsService.createDailyCheck(body);
    return NextResponse.json({ success: true, data: newCheck }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
