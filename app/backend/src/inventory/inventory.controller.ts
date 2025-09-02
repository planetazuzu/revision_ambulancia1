import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  create(@Body() createInventoryItemDto: CreateInventoryItemDto, @Request() req) {
    return this.inventoryService.create(createInventoryItemDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('ambulanceId') ambulanceId?: string,
    @Query('materialId') materialId?: string,
    @Query('status') status?: string,
    @Query('location') location?: string,
    @Query('critical') critical?: string,
  ) {
    const filters: any = {};
    
    if (ambulanceId) filters.ambulanceId = ambulanceId;
    if (materialId) filters.materialId = materialId;
    if (status) filters.status = status;
    if (location) filters.location = location;
    if (critical !== undefined) filters.critical = critical === 'true';

    return this.inventoryService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.inventoryService.getInventoryStats();
  }

  @Get('low-stock')
  getLowStockItems() {
    return this.inventoryService.getLowStockItems();
  }

  @Get('expired')
  getExpiredItems() {
    return this.inventoryService.getExpiredItems();
  }

  @Get('expiring')
  getExpiringItems(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 30;
    return this.inventoryService.getExpiringItems(daysNumber);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Get(':id/logs')
  getLogs(@Param('id') itemId: string) {
    return this.inventoryService.getInventoryLogs(itemId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInventoryItemDto: UpdateInventoryItemDto,
    @Request() req,
  ) {
    return this.inventoryService.update(id, updateInventoryItemDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
