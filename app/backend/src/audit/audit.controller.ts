import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditService.create(createAuditLogDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  findAll(
    @Query('actorId') actorId?: string,
    @Query('action') action?: string,
    @Query('tableName') tableName?: string,
    @Query('recordId') recordId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const filters: any = {};
    
    if (actorId) filters.actorId = actorId;
    if (action) filters.action = action;
    if (tableName) filters.tableName = tableName;
    if (recordId) filters.recordId = recordId;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);
    if (limit) filters.limit = parseInt(limit);
    if (offset) filters.offset = parseInt(offset);

    return this.auditService.findAll(filters);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  getStats() {
    return this.auditService.getStats();
  }

  @Get('recent')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  getRecentActivity(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit) : 50;
    return this.auditService.getRecentActivity(limitNumber);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  getUserActivity(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit) : 100;
    return this.auditService.getUserActivity(userId, limitNumber);
  }

  @Get('table/:tableName')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  getTableActivity(
    @Param('tableName') tableName: string,
    @Query('recordId') recordId?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNumber = limit ? parseInt(limit) : 100;
    return this.auditService.getTableActivity(tableName, recordId, limitNumber);
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.AUDITOR)
  findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }
}
