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
import { MaterialsService } from './materials.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreateMaterialCategoryDto } from './dto/create-material-category.dto';
import { UpdateMaterialCategoryDto } from './dto/update-material-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('materials')
@UseGuards(JwtAuthGuard)
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  // Material Categories
  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  createCategory(@Body() createCategoryDto: CreateMaterialCategoryDto) {
    return this.materialsService.createCategory(createCategoryDto);
  }

  @Get('categories')
  findAllCategories() {
    return this.materialsService.findAllCategories();
  }

  @Get('categories/:id')
  findCategoryById(@Param('id') id: string) {
    return this.materialsService.findCategoryById(id);
  }

  @Patch('categories/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateMaterialCategoryDto,
  ) {
    return this.materialsService.updateCategory(id, updateCategoryDto);
  }

  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  removeCategory(@Param('id') id: string) {
    return this.materialsService.removeCategory(id);
  }

  // Materials
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  create(@Body() createMaterialDto: CreateMaterialDto) {
    return this.materialsService.create(createMaterialDto);
  }

  @Get()
  findAll(
    @Query('categoryId') categoryId?: string,
    @Query('critical') critical?: string,
    @Query('search') search?: string,
  ) {
    const filters: any = {};
    
    if (categoryId) filters.categoryId = categoryId;
    if (critical !== undefined) filters.critical = critical === 'true';
    if (search) filters.search = search;

    return this.materialsService.findAll(filters);
  }

  @Get('stats')
  getStats() {
    return this.materialsService.getMaterialStats();
  }

  @Get('search')
  searchMaterials(@Query('q') query: string) {
    return this.materialsService.searchMaterials(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.materialsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  update(
    @Param('id') id: string,
    @Body() updateMaterialDto: UpdateMaterialDto,
  ) {
    return this.materialsService.update(id, updateMaterialDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  remove(@Param('id') id: string) {
    return this.materialsService.remove(id);
  }
}
