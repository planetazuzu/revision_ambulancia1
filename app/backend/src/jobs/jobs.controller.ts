import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('daily')
  @Roles(Role.ADMIN, Role.COORDINADOR)
  @ApiOperation({ summary: 'Ejecutar trabajos diarios manualmente' })
  @ApiResponse({ status: 200, description: 'Trabajos diarios ejecutados' })
  async triggerDailyJobs() {
    await this.jobsService.triggerDailyJobs();
    return { message: 'Trabajos diarios ejecutados correctamente' };
  }

  @Post('hourly')
  @Roles(Role.ADMIN, Role.COORDINADOR)
  @ApiOperation({ summary: 'Ejecutar trabajos por hora manualmente' })
  @ApiResponse({ status: 200, description: 'Trabajos por hora ejecutados' })
  async triggerHourlyJobs() {
    await this.jobsService.triggerHourlyJobs();
    return { message: 'Trabajos por hora ejecutados correctamente' };
  }
}
