import { NextRequest, NextResponse } from 'next/server';
import { materialsService } from '@/lib/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await materialsService.getConsumableMaterialById(params.id);
    return NextResponse.json({ success: true, data: material });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updatedMaterial = await materialsService.updateConsumableMaterial(params.id, body);
    return NextResponse.json({ success: true, data: updatedMaterial });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await materialsService.deleteConsumableMaterial(params.id);
    return NextResponse.json({ success: true, message: 'Material eliminado exitosamente' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
