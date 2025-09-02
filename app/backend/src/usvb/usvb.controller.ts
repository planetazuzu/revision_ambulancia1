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
} from '@nestjs/common';
import { USVBService } from './usvb.service';
import { CreateUSVBKitDto } from './dto/create-usvb-kit.dto';
import { UpdateUSVBKitDto } from './dto/update-usvb-kit.dto';
import { CreateUSVBKitMaterialDto } from './dto/create-usvb-kit-material.dto';
import { UpdateUSVBKitMaterialDto } from './dto/update-usvb-kit-material.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('usvb')
@UseGuards(JwtAuthGuard)
export class USVBController {
  constructor(private readonly usvbService: USVBService) {}

  // USVB Kits
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  create(@Body() createUSVBKitDto: CreateUSVBKitDto) {
    return this.usvbService.create(createUSVBKitDto);
  }

  @Get()
  findAll() {
    return this.usvbService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.usvbService.getStats();
  }

  @Get('low-stock')
  getLowStockKits() {
    return this.usvbService.getLowStockKits();
  }

  @Get('number/:number')
  findByNumber(@Param('number') number: string) {
    return this.usvbService.findByNumber(parseInt(number));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usvbService.findOne(id);
  }

  @Get(':id/status')
  getKitStatus(@Param('id') id: string) {
    return this.usvbService.getKitStatus(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  update(
    @Param('id') id: string,
    @Body() updateUSVBKitDto: UpdateUSVBKitDto,
  ) {
    return this.usvbService.update(id, updateUSVBKitDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  remove(@Param('id') id: string) {
    return this.usvbService.remove(id);
  }

  // USVB Kit Materials
  @Post(':kitId/materials')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  createMaterial(
    @Param('kitId') kitId: string,
    @Body() createMaterialDto: CreateUSVBKitMaterialDto,
  ) {
    return this.usvbService.createMaterial(kitId, createMaterialDto);
  }

  @Patch('materials/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  updateMaterial(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateUSVBKitMaterialDto,
  ) {
    return this.usvbService.updateMaterial(id, updateMaterialDto);
  }

  @Patch('materials/:id/quantity')
  updateMaterialQuantity(
    @Param('id') id: string,
    @Body() body: { quantity: number },
  ) {
    return this.usvbService.updateMaterialQuantity(id, body.quantity);
  }

  @Delete('materials/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  removeMaterial(@Param('id') id: string) {
    return this.usvbService.removeMaterial(id);
  }
}
