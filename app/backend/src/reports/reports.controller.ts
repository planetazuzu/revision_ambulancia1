import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('incidents.pdf')
  @Roles(Role.ADMIN, Role.COORDINADOR)
  @ApiOperation({ summary: 'Generar reporte PDF de incidencias' })
  @ApiQuery({ name: 'from', required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
  @ApiResponse({ status: 200, description: 'PDF generado correctamente' })
  async generateIncidentsPDF(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Res() res?: Response,
  ) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const pdf = await this.reportsService.generateIncidentsPDF(fromDate, toDate);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="incidencias-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdf);
  }

  @Get('inventory.xlsx')
  @Roles(Role.ADMIN, Role.COORDINADOR)
  @ApiOperation({ summary: 'Generar reporte Excel de inventario' })
  @ApiQuery({ name: 'ambulanceId', required: false, description: 'ID de ambulancia específica' })
  @ApiResponse({ status: 200, description: 'Excel generado correctamente' })
  async generateInventoryExcel(
    @Query('ambulanceId') ambulanceId?: string,
    @Res() res?: Response,
  ) {
    const workbook = await this.reportsService.generateInventoryExcel(ambulanceId);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="inventario-${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('dashboard/kpis')
  @ApiOperation({ summary: 'Obtener KPIs del dashboard' })
  @ApiResponse({ status: 200, description: 'KPIs obtenidos correctamente' })
  async getDashboardKPIs() {
    return this.reportsService.getDashboardKPIs();
  }
}
