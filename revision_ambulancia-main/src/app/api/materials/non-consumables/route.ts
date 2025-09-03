import { NextRequest, NextResponse } from 'next/server';
import { materialsService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const materials = await materialsService.getNonConsumableMaterials();
    return NextResponse.json({ success: true, data: materials });
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
    const newMaterial = await materialsService.createNonConsumableMaterial(body);
    return NextResponse.json({ success: true, data: newMaterial }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
