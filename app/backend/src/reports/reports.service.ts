import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import * as ExcelJS from 'exceljs';
import { differenceInDays } from 'date-fns';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateIncidentsPDF(fromDate?: Date, toDate?: Date) {
    const incidents = await this.prisma.incident.findMany({
      where: {
        createdAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        ambulance: true,
        inventoryItem: {
          include: {
            material: true,
          },
        },
        responsible: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const html = this.generateIncidentsHTML(incidents, fromDate, toDate);
    
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: true,
    });
    
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
    
    await browser.close();
    
    return pdf;
  }

  async generateInventoryExcel(ambulanceId?: string) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Inventario');

    // Headers
    worksheet.columns = [
      { header: 'Ambulancia', key: 'ambulance', width: 20 },
      { header: 'Material', key: 'material', width: 30 },
      { header: 'Lote', key: 'batch', width: 15 },
      { header: 'Cantidad', key: 'quantity', width: 10 },
      { header: 'Ubicación', key: 'location', width: 25 },
      { header: 'Stock Mínimo', key: 'minStock', width: 12 },
      { header: 'Fecha Caducidad', key: 'expiryDate', width: 15 },
      { header: 'Estado', key: 'status', width: 10 },
      { header: 'Días hasta Caducidad', key: 'daysToExpiry', width: 18 },
    ];

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A8FE7' },
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    const inventoryItems = await this.prisma.inventoryItem.findMany({
      where: ambulanceId ? { ambulanceId } : undefined,
      include: {
        ambulance: true,
        material: true,
      },
      orderBy: [
        { ambulance: { name: 'asc' } },
        { material: { name: 'asc' } },
      ],
    });

    const today = new Date();
    
    for (const item of inventoryItems) {
      const daysToExpiry = item.expiryDate ? 
        differenceInDays(item.expiryDate, today) : null;

      const row = worksheet.addRow({
        ambulance: item.ambulance.name,
        material: item.material.name,
        batch: item.batch || 'N/A',
        quantity: item.qty,
        location: item.location || 'N/A',
        minStock: item.minStock,
        expiryDate: item.expiryDate ? item.expiryDate.toLocaleDateString() : 'N/A',
        status: item.status,
        daysToExpiry: daysToExpiry !== null ? daysToExpiry : 'N/A',
      });

      // Color coding based on status
      if (item.status === 'EXPIRED') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFE6E6' },
        };
      } else if (item.status === 'LOW') {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFF3CD' },
        };
      } else if (daysToExpiry !== null && daysToExpiry <= 30) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE6F3FF' },
        };
      }
    }

    // Add summary sheet
    const summarySheet = workbook.addWorksheet('Resumen');
    summarySheet.columns = [
      { header: 'Métrica', key: 'metric', width: 30 },
      { header: 'Valor', key: 'value', width: 15 },
    ];

    const totalItems = inventoryItems.length;
    const expiredItems = inventoryItems.filter(item => item.status === 'EXPIRED').length;
    const lowStockItems = inventoryItems.filter(item => item.status === 'LOW').length;
    const expiringSoon = inventoryItems.filter(item => 
      item.expiryDate && differenceInDays(item.expiryDate, today) <= 30
    ).length;

    summarySheet.addRow({ metric: 'Total de Items', value: totalItems });
    summarySheet.addRow({ metric: 'Items Caducados', value: expiredItems });
    summarySheet.addRow({ metric: 'Stock Bajo', value: lowStockItems });
    summarySheet.addRow({ metric: 'Caducan en 30 días', value: expiringSoon });

    // Style summary headers
    summarySheet.getRow(1).font = { bold: true };
    summarySheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4A8FE7' },
    };
    summarySheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    return workbook;
  }

  async getDashboardKPIs() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const [
      totalAmbulances,
      activeAmbulances,
      totalIncidents,
      openIncidents,
      criticalIncidents,
      expiredMaterials,
      lowStockItems,
      expiringSoon,
      todayChecklists,
      completedChecklists,
    ] = await Promise.all([
      this.prisma.ambulance.count(),
      this.prisma.ambulance.count({
        where: { status: 'OK' },
      }),
      this.prisma.incident.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
      this.prisma.incident.count({
        where: { status: 'OPEN' },
      }),
      this.prisma.incident.count({
        where: { severity: 'CRITICAL' },
      }),
      this.prisma.inventoryItem.count({
        where: { status: 'EXPIRED' },
      }),
      this.prisma.inventoryItem.count({
        where: { status: 'LOW' },
      }),
      this.prisma.inventoryItem.count({
        where: {
          expiryDate: {
            gte: today,
            lte: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
          },
          status: 'OK',
        },
      }),
      this.prisma.checklist.count({
        where: {
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
        },
      }),
      this.prisma.checklist.count({
        where: {
          date: {
            gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            lt: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
          },
          status: 'DONE',
        },
      }),
    ]);

    const checklistCompletionRate = todayChecklists > 0 ? 
      (completedChecklists / todayChecklists) * 100 : 0;

    return {
      ambulances: {
        total: totalAmbulances,
        active: activeAmbulances,
        inactive: totalAmbulances - activeAmbulances,
      },
      incidents: {
        total: totalIncidents,
        open: openIncidents,
        critical: criticalIncidents,
        resolved: totalIncidents - openIncidents,
      },
      inventory: {
        expired: expiredMaterials,
        lowStock: lowStockItems,
        expiringSoon,
        total: await this.prisma.inventoryItem.count(),
      },
      checklists: {
        today: todayChecklists,
        completed: completedChecklists,
        completionRate: Math.round(checklistCompletionRate),
      },
    };
  }

  private generateIncidentsHTML(incidents: any[], fromDate?: Date, toDate?: Date): string {
    const dateRange = fromDate && toDate ? 
      `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}` : 
      'Todos los registros';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Reporte de Incidencias - AmbuReview</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { color: #4A8FE7; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .summary { background: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .summary h3 { margin: 0 0 10px 0; color: #333; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-item .number { font-size: 24px; font-weight: bold; color: #4A8FE7; }
          .summary-item .label { font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #4A8FE7; color: white; }
          .severity-critical { background-color: #ffebee; color: #c62828; }
          .severity-high { background-color: #fff3e0; color: #ef6c00; }
          .severity-medium { background-color: #e3f2fd; color: #1976d2; }
          .severity-low { background-color: #e8f5e8; color: #2e7d32; }
          .status-open { background-color: #ffebee; }
          .status-in-progress { background-color: #fff3e0; }
          .status-resolved { background-color: #e8f5e8; }
          .status-closed { background-color: #f3e5f5; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte de Incidencias</h1>
          <p>AmbuReview - Sistema de Gestión de Ambulancias</p>
          <p>Período: ${dateRange}</p>
          <p>Generado: ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary">
          <h3>Resumen</h3>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${incidents.length}</div>
              <div class="label">Total Incidencias</div>
            </div>
            <div class="summary-item">
              <div class="number">${incidents.filter(i => i.status === 'OPEN').length}</div>
              <div class="label">Abiertas</div>
            </div>
            <div class="summary-item">
              <div class="number">${incidents.filter(i => i.severity === 'CRITICAL').length}</div>
              <div class="label">Críticas</div>
            </div>
            <div class="summary-item">
              <div class="number">${incidents.filter(i => i.status === 'RESOLVED').length}</div>
              <div class="label">Resueltas</div>
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Ambulancia</th>
              <th>Tipo</th>
              <th>Severidad</th>
              <th>Título</th>
              <th>Estado</th>
              <th>Responsable</th>
              <th>Fecha Límite</th>
            </tr>
          </thead>
          <tbody>
            ${incidents.map(incident => `
              <tr>
                <td>${incident.createdAt.toLocaleDateString()}</td>
                <td>${incident.ambulance.name}</td>
                <td>${incident.type}</td>
                <td class="severity-${incident.severity.toLowerCase()}">${incident.severity}</td>
                <td>${incident.title}</td>
                <td class="status-${incident.status.toLowerCase().replace('_', '-')}">${incident.status}</td>
                <td>${incident.responsible?.name || 'N/A'}</td>
                <td>${incident.dueDate ? incident.dueDate.toLocaleDateString() : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}
