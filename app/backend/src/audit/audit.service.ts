import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async create(createAuditLogDto: CreateAuditLogDto) {
    return this.prisma.auditLog.create({
      data: createAuditLogDto,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async findAll(filters?: {
    actorId?: string;
    action?: string;
    tableName?: string;
    recordId?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters?.actorId) {
      where.actorId = filters.actorId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.tableName) {
      where.tableName = filters.tableName;
    }

    if (filters?.recordId) {
      where.recordId = filters.recordId;
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

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit || 100,
        skip: filters?.offset || 0
      }),
      this.prisma.auditLog.count({ where })
    ]);

    return {
      logs,
      total,
      limit: filters?.limit || 100,
      offset: filters?.offset || 0
    };
  }

  async findOne(id: string) {
    return this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });
  }

  async getStats() {
    const total = await this.prisma.auditLog.count();
    
    const byAction = await this.prisma.auditLog.groupBy({
      by: ['action'],
      _count: {
        action: true
      }
    });

    const byTable = await this.prisma.auditLog.groupBy({
      by: ['tableName'],
      _count: {
        tableName: true
      }
    });

    const byActor = await this.prisma.auditLog.groupBy({
      by: ['actorId'],
      _count: {
        actorId: true
      }
    });

    // Obtener información de los actores
    const actorIds = byActor.map(item => item.actorId).filter(Boolean);
    const actors = await this.prisma.user.findMany({
      where: {
        id: { in: actorIds }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    const byActorWithInfo = byActor.map(item => {
      const actor = actors.find(a => a.id === item.actorId);
      return {
        actorId: item.actorId,
        count: item._count.actorId,
        actor: actor || null
      };
    });

    // Actividad por día (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = await this.prisma.auditLog.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: {
        createdAt: true
      }
    });

    return {
      total,
      byAction: byAction.map(item => ({
        action: item.action,
        count: item._count.action
      })),
      byTable: byTable.map(item => ({
        tableName: item.tableName,
        count: item._count.tableName
      })),
      byActor: byActorWithInfo,
      dailyActivity: dailyActivity.map(item => ({
        date: item.createdAt,
        count: item._count.createdAt
      }))
    };
  }

  async getRecentActivity(limit: number = 50) {
    return this.prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getUserActivity(userId: string, limit: number = 100) {
    return this.prisma.auditLog.findMany({
      where: { actorId: userId },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async getTableActivity(tableName: string, recordId?: string, limit: number = 100) {
    const where: any = { tableName };
    
    if (recordId) {
      where.recordId = recordId;
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  // Método helper para crear logs de auditoría
  async logAction(
    actorId: string,
    action: string,
    tableName: string,
    recordId?: string,
    payload?: any,
    ipAddress?: string,
    userAgent?: string
  ) {
    return this.create({
      actorId,
      action,
      tableName,
      recordId,
      payload,
      ipAddress,
      userAgent
    });
  }
}
