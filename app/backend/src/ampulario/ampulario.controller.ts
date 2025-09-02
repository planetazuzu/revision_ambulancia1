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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AmpularioService } from './ampulario.service';
import { CreateAmpularioMaterialDto } from './dto/create-ampulario-material.dto';
import { UpdateAmpularioMaterialDto } from './dto/update-ampulario-material.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Controller('ampulario')
@UseGuards(JwtAuthGuard)
export class AmpularioController {
  constructor(private readonly ampularioService: AmpularioService) {}

  // Spaces
  @Post('spaces')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  createSpace(@Body() createSpaceDto: CreateSpaceDto) {
    return this.ampularioService.createSpace(createSpaceDto);
  }

  @Get('spaces')
  findAllSpaces() {
    return this.ampularioService.findAllSpaces();
  }

  @Get('spaces/:id')
  findSpaceById(@Param('id') id: string) {
    return this.ampularioService.findSpaceById(id);
  }

  @Patch('spaces/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  updateSpace(
    @Param('id') id: string,
    @Body() updateSpaceDto: UpdateSpaceDto,
  ) {
    return this.ampularioService.updateSpace(id, updateSpaceDto);
  }

  @Delete('spaces/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  removeSpace(@Param('id') id: string) {
    return this.ampularioService.removeSpace(id);
  }

  // Materials
  @Post('materials')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  create(@Body() createAmpularioMaterialDto: CreateAmpularioMaterialDto) {
    return this.ampularioService.create(createAmpularioMaterialDto);
  }

  @Get('materials')
  findAll(
    @Query('spaceId') spaceId?: string,
    @Query('route') route?: string,
    @Query('nameQuery') nameQuery?: string,
    @Query('expiring') expiring?: string,
    @Query('lowStock') lowStock?: string,
  ) {
    const filters: any = {};
    
    if (spaceId) filters.spaceId = spaceId;
    if (route) filters.route = route;
    if (nameQuery) filters.nameQuery = nameQuery;
    if (expiring === 'true') filters.expiring = true;
    if (lowStock === 'true') filters.lowStock = true;

    return this.ampularioService.findAll(filters);
  }

  @Get('materials/stats')
  getStats() {
    return this.ampularioService.getStats();
  }

  @Get('materials/expired')
  getExpiredMaterials() {
    return this.ampularioService.getExpiredMaterials();
  }

  @Get('materials/expiring')
  getExpiringMaterials(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days) : 30;
    return this.ampularioService.getExpiringMaterials(daysNumber);
  }

  @Get('materials/low-stock')
  getLowStockMaterials() {
    return this.ampularioService.getLowStockMaterials();
  }

  @Get('materials/alerts')
  getAlerts(@Query('spaceId') spaceId?: string) {
    return this.ampularioService.getAlerts(spaceId);
  }

  @Get('materials/:id')
  findOne(@Param('id') id: string) {
    return this.ampularioService.findOne(id);
  }

  @Patch('materials/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  update(
    @Param('id') id: string,
    @Body() updateAmpularioMaterialDto: UpdateAmpularioMaterialDto,
  ) {
    return this.ampularioService.update(id, updateAmpularioMaterialDto);
  }

  @Delete('materials/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  remove(@Param('id') id: string) {
    return this.ampularioService.remove(id);
  }

  // CSV Import
  @Post('import')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  @UseInterceptors(FileInterceptor('file'))
  async importFromCSV(
    @UploadedFile() file: Express.Multer.File,
    @Query('spaceId') spaceId: string,
  ) {
    if (!file) {
      throw new Error('No se proporcionó archivo');
    }

    if (!spaceId) {
      throw new Error('No se proporcionó spaceId');
    }

    const csvData = [];
    const stream = Readable.from(file.buffer.toString());

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => csvData.push(row))
        .on('end', async () => {
          try {
            const result = await this.ampularioService.importFromCSV(csvData, spaceId);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }
}
