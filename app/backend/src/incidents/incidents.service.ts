import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentDto } from './dto/update-incident.dto';

@Injectable()
export class IncidentsService {
  constructor(private prisma: PrismaService) {}

  async create(createIncidentDto: CreateIncidentDto, userId: string) {
    // Verificar que la ambulancia existe
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id: createIncidentDto.ambulanceId }
    });

    if (!ambulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    // Si hay un inventoryItemId, verificar que existe
    if (createIncidentDto.inventoryItemId) {
      const inventoryItem = await this.prisma.inventoryItem.findUnique({
        where: { id: createIncidentDto.inventoryItemId }
      });

      if (!inventoryItem) {
        throw new NotFoundException('Item de inventario no encontrado');
      }
    }

    return this.prisma.incident.create({
      data: {
        ...createIncidentDto,
        responsibleId: createIncidentDto.responsibleId || userId
      },
      include: {
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        },
        inventoryItem: {
          include: {
            material: true
          }
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async findAll(filters?: {
    ambulanceId?: string;
    type?: string;
    severity?: string;
    status?: string;
    responsibleId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }) {
    const where: any = {};

    if (filters?.ambulanceId) {
      where.ambulanceId = filters.ambulanceId;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.severity) {
      where.severity = filters.severity;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.responsibleId) {
      where.responsibleId = filters.responsibleId;
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    return this.prisma.incident.findMany({
      where,
      include: {
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        },
        inventoryItem: {
          include: {
            material: true
          }
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id },
      include: {
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        },
        inventoryItem: {
          include: {
            material: true
          }
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!incident) {
      throw new NotFoundException('Incidente no encontrado');
    }

    return incident;
  }

  async update(id: string, updateIncidentDto: UpdateIncidentDto) {
    const incident = await this.findOne(id);
    
    return this.prisma.incident.update({
      where: { id },
      data: {
        ...updateIncidentDto,
        resolvedAt: updateIncidentDto.status === 'RESOLVED' ? new Date() : null
      },
      include: {
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        },
        inventoryItem: {
          include: {
            material: true
          }
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async remove(id: string) {
    const incident = await this.findOne(id);
    
    return this.prisma.incident.delete({
      where: { id }
    });
  }

  async getStats() {
    const total = await this.prisma.incident.count();
    const open = await this.prisma.incident.count({
      where: { status: 'OPEN' }
    });
    const inProgress = await this.prisma.incident.count({
      where: { status: 'IN_PROGRESS' }
    });
    const resolved = await this.prisma.incident.count({
      where: { status: 'RESOLVED' }
    });
    const closed = await this.prisma.incident.count({
      where: { status: 'CLOSED' }
    });

    const byType = await this.prisma.incident.groupBy({
      by: ['type'],
      _count: {
        type: true
      }
    });

    const bySeverity = await this.prisma.incident.groupBy({
      by: ['severity'],
      _count: {
        severity: true
      }
    });

    return {
      total,
      byStatus: {
        open,
        inProgress,
        resolved,
        closed
      },
      byType: byType.map(item => ({
        type: item.type,
        count: item._count.type
      })),
      bySeverity: bySeverity.map(item => ({
        severity: item.severity,
        count: item._count.severity
      }))
    };
  }

  async getOverdueIncidents() {
    const now = new Date();
    
    return this.prisma.incident.findMany({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS']
        },
        dueDate: {
          lt: now
        }
      },
      include: {
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        },
        responsible: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
  }
}
