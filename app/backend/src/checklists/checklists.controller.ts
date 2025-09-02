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
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('checklists')
@UseGuards(JwtAuthGuard)
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  // Checklist Templates
  @Post('templates')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  createTemplate(@Body() createTemplateDto: CreateChecklistTemplateDto) {
    return this.checklistsService.createTemplate(createTemplateDto);
  }

  @Get('templates')
  findAllTemplates() {
    return this.checklistsService.findAllTemplates();
  }

  @Get('templates/:id')
  findTemplateById(@Param('id') id: string) {
    return this.checklistsService.findTemplateById(id);
  }

  @Patch('templates/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  updateTemplate(
    @Param('id') id: string,
    @Body() updateTemplateDto: UpdateChecklistTemplateDto,
  ) {
    return this.checklistsService.updateTemplate(id, updateTemplateDto);
  }

  @Delete('templates/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  removeTemplate(@Param('id') id: string) {
    return this.checklistsService.removeTemplate(id);
  }

  // Checklist Items
  @Post('templates/:templateId/items')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  createItem(
    @Param('templateId') templateId: string,
    @Body() createItemDto: any,
  ) {
    return this.checklistsService.createItem(templateId, createItemDto);
  }

  @Patch('items/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  updateItem(@Param('id') id: string, @Body() updateItemDto: any) {
    return this.checklistsService.updateItem(id, updateItemDto);
  }

  @Delete('items/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  removeItem(@Param('id') id: string) {
    return this.checklistsService.removeItem(id);
  }

  // Checklists
  @Post()
  create(@Body() createChecklistDto: CreateChecklistDto, @Request() req) {
    return this.checklistsService.create(createChecklistDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('ambulanceId') ambulanceId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters: any = {};
    
    if (ambulanceId) filters.ambulanceId = ambulanceId;
    if (userId) filters.userId = userId;
    if (status) filters.status = status;
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.checklistsService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checklistsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateChecklistDto: UpdateChecklistDto,
  ) {
    return this.checklistsService.update(id, updateChecklistDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINADOR)
  remove(@Param('id') id: string) {
    return this.checklistsService.remove(id);
  }

  // Checklist Responses
  @Post(':id/responses/:itemId')
  saveResponse(
    @Param('id') checklistId: string,
    @Param('itemId') itemId: string,
    @Body() responseData: any,
  ) {
    return this.checklistsService.saveResponse(checklistId, itemId, responseData);
  }

  @Get(':id/responses')
  getResponses(@Param('id') checklistId: string) {
    return this.checklistsService.getResponses(checklistId);
  }
}
