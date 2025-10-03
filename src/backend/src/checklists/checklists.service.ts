import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';
import { CreateChecklistTemplateDto } from './dto/create-checklist-template.dto';
import { UpdateChecklistTemplateDto } from './dto/update-checklist-template.dto';

@Injectable()
export class ChecklistsService {
  constructor(private prisma: PrismaService) {}

  // Checklist Templates
  async createTemplate(createTemplateDto: CreateChecklistTemplateDto) {
    return this.prisma.checklistTemplate.create({
      data: createTemplateDto,
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  async findAllTemplates() {
    return this.prisma.checklistTemplate.findMany({
      include: {
        items: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { checklists: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findTemplateById(id: string) {
    const template = await this.prisma.checklistTemplate.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!template) {
      throw new NotFoundException('Template no encontrado');
    }

    return template;
  }

  async updateTemplate(id: string, updateTemplateDto: UpdateChecklistTemplateDto) {
    const template = await this.findTemplateById(id);
    
    return this.prisma.checklistTemplate.update({
      where: { id },
      data: updateTemplateDto,
      include: {
        items: {
          orderBy: { order: 'asc' }
        }
      }
    });
  }

  async removeTemplate(id: string) {
    const template = await this.findTemplateById(id);
    
    // Verificar si hay checklists usando este template
    const checklistsCount = await this.prisma.checklist.count({
      where: { templateId: id }
    });

    if (checklistsCount > 0) {
      throw new ForbiddenException('No se puede eliminar un template que está siendo usado');
    }

    return this.prisma.checklistTemplate.delete({
      where: { id }
    });
  }

  // Checklist Items
  async createItem(templateId: string, createItemDto: any) {
    const template = await this.findTemplateById(templateId);
    
    return this.prisma.checklistItem.create({
      data: {
        ...createItemDto,
        templateId
      }
    });
  }

  async updateItem(id: string, updateItemDto: any) {
    return this.prisma.checklistItem.update({
      where: { id },
      data: updateItemDto
    });
  }

  async removeItem(id: string) {
    return this.prisma.checklistItem.delete({
      where: { id }
    });
  }

  // Checklists
  async create(createChecklistDto: CreateChecklistDto, userId: string) {
    const template = await this.findTemplateById(createChecklistDto.templateId);
    
    return this.prisma.checklist.create({
      data: {
        ...createChecklistDto,
        userId
      },
      include: {
        template: {
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        },
        responses: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        }
      }
    });
  }

  async findAll(filters?: {
    ambulanceId?: string;
    userId?: string;
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters?.ambulanceId) {
      where.ambulanceId = filters.ambulanceId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.date = {};
      if (filters.dateFrom) {
        where.date.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.date.lte = filters.dateTo;
      }
    }

    return this.prisma.checklist.findMany({
      where,
      include: {
        template: {
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        },
        responses: {
          include: {
            item: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  async findOne(id: string) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
      include: {
        template: {
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        },
        responses: {
          include: {
            item: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        }
      }
    });

    if (!checklist) {
      throw new NotFoundException('Checklist no encontrado');
    }

    return checklist;
  }

  async update(id: string, updateChecklistDto: UpdateChecklistDto) {
    const checklist = await this.findOne(id);
    
    return this.prisma.checklist.update({
      where: { id },
      data: updateChecklistDto,
      include: {
        template: {
          include: {
            items: {
              orderBy: { order: 'asc' }
            }
          }
        },
        responses: {
          include: {
            item: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        }
      }
    });
  }

  async remove(id: string) {
    const checklist = await this.findOne(id);
    
    return this.prisma.checklist.delete({
      where: { id }
    });
  }

  // Checklist Responses
  async saveResponse(checklistId: string, itemId: string, responseData: any) {
    const checklist = await this.findOne(checklistId);
    
    return this.prisma.checklistResponse.upsert({
      where: {
        checklistId_itemId: {
          checklistId,
          itemId
        }
      },
      update: responseData,
      create: {
        checklistId,
        itemId,
        ...responseData
      }
    });
  }

  async getResponses(checklistId: string) {
    return this.prisma.checklistResponse.findMany({
      where: { checklistId },
      include: {
        item: true
      }
    });
  }
}
