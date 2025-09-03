import { NextRequest, NextResponse } from 'next/server';
import { inventoryService } from '@/lib/services';

export async function GET(request: NextRequest) {
  try {
    const logs = await inventoryService.getCentralInventoryLogs();
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
    const newLog = await inventoryService.createCentralInventoryLog(body);
    return NextResponse.json({ success: true, data: newLog }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
