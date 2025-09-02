import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AmbulancesService } from './ambulances.service';
import { CreateAmbulanceDto } from './dto/create-ambulance.dto';
import { UpdateAmbulanceDto } from './dto/update-ambulance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('ambulances')
@Controller('ambulances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AmbulancesController {
  constructor(private readonly ambulancesService: AmbulancesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COORDINADOR)
  @ApiOperation({ summary: 'Crear nueva ambulancia' })
  @ApiResponse({ status: 201, description: 'Ambulancia creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Código o matrícula ya existe' })
  create(@Body() createAmbulanceDto: CreateAmbulanceDto) {
    return this.ambulancesService.create(createAmbulanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las ambulancias' })
  @ApiResponse({ status: 200, description: 'Lista de ambulancias' })
  findAll() {
    return this.ambulancesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ambulancia por ID' })
  @ApiResponse({ status: 200, description: 'Ambulancia encontrada' })
  @ApiResponse({ status: 404, description: 'Ambulancia no encontrada' })
  findOne(@Param('id') id: string) {
    return this.ambulancesService.findOne(id);
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Obtener estado de ambulancia' })
  @ApiResponse({ status: 200, description: 'Estado de ambulancia' })
  getStatus(@Param('id') id: string) {
    return this.ambulancesService.getAmbulanceStatus(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COORDINADOR)
  @ApiOperation({ summary: 'Actualizar ambulancia' })
  @ApiResponse({ status: 200, description: 'Ambulancia actualizada' })
  @ApiResponse({ status: 404, description: 'Ambulancia no encontrada' })
  update(@Param('id') id: string, @Body() updateAmbulanceDto: UpdateAmbulanceDto) {
    return this.ambulancesService.update(id, updateAmbulanceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar ambulancia' })
  @ApiResponse({ status: 200, description: 'Ambulancia eliminada' })
  @ApiResponse({ status: 404, description: 'Ambulancia no encontrada' })
  remove(@Param('id') id: string) {
    return this.ambulancesService.remove(id);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Registrar check-in de ambulancia' })
  @ApiResponse({ status: 200, description: 'Check-in registrado' })
  checkIn(
    @Param('id') id: string,
    @Body('kilometers') kilometers: number,
    @CurrentUser() user: any,
  ) {
    return this.ambulancesService.updateCheckInDetails(id, kilometers, user.id);
  }

  @Post(':id/workflow/:step')
  @ApiOperation({ summary: 'Actualizar paso del flujo de trabajo' })
  @ApiResponse({ status: 200, description: 'Paso actualizado' })
  updateWorkflowStep(
    @Param('id') id: string,
    @Param('step') step: string,
    @Body('status') status: boolean,
  ) {
    return this.ambulancesService.updateWorkflowStep(id, step, status);
  }
}
