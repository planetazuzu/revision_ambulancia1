import { NextRequest, NextResponse } from 'next/server';
import { reviewsService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ambulanceId = searchParams.get('ambulanceId');
    
    const reviews = await reviewsService.getMechanicalReviews(ambulanceId || undefined);
    return NextResponse.json({ success: true, data: reviews });
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
    const newReview = await reviewsService.createMechanicalReview(body);
    return NextResponse.json({ success: true, data: newReview }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
