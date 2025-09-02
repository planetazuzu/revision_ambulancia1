import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async create(createInventoryItemDto: CreateInventoryItemDto, userId: string) {
    // Verificar que la ambulancia existe
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id: createInventoryItemDto.ambulanceId }
    });

    if (!ambulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    // Verificar que el material existe
    const material = await this.prisma.material.findUnique({
      where: { id: createInventoryItemDto.materialId }
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    // Verificar si ya existe un item con el mismo material en la misma ambulancia
    const existingItem = await this.prisma.inventoryItem.findFirst({
      where: {
        ambulanceId: createInventoryItemDto.ambulanceId,
        materialId: createInventoryItemDto.materialId,
        batch: createInventoryItemDto.batch
      }
    });

    if (existingItem) {
      throw new BadRequestException('Ya existe un item con este material y lote en esta ambulancia');
    }

    const item = await this.prisma.inventoryItem.create({
      data: createInventoryItemDto,
      include: {
        material: {
          include: {
            category: true
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

    // Crear log de inventario
    await this.prisma.inventoryLog.create({
      data: {
        inventoryItemId: item.id,
        diff: item.qty,
        reason: 'Creación inicial',
        userId
      }
    });

    return item;
  }

  async findAll(filters?: {
    ambulanceId?: string;
    materialId?: string;
    status?: string;
    location?: string;
    critical?: boolean;
  }) {
    const where: any = {};

    if (filters?.ambulanceId) {
      where.ambulanceId = filters.ambulanceId;
    }

    if (filters?.materialId) {
      where.materialId = filters.materialId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.location) {
      where.location = {
        contains: filters.location,
        mode: 'insensitive'
      };
    }

    if (filters?.critical !== undefined) {
      where.material = {
        critical: filters.critical
      };
    }

    return this.prisma.inventoryItem.findMany({
      where,
      include: {
        material: {
          include: {
            category: true
          }
        },
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        },
        _count: {
          select: { logs: true }
        }
      },
      orderBy: [
        { ambulance: { code: 'asc' } },
        { material: { name: 'asc' } }
      ]
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        material: {
          include: {
            category: true
          }
        },
        ambulance: {
          select: {
            id: true,
            code: true,
            name: true,
            plate: true
          }
        },
        logs: {
          include: {
            inventoryItem: {
              include: {
                material: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!item) {
      throw new NotFoundException('Item de inventario no encontrado');
    }

    return item;
  }

  async update(id: string, updateInventoryItemDto: UpdateInventoryItemDto, userId: string) {
    const item = await this.findOne(id);
    
    const oldQty = item.qty;
    const newQty = updateInventoryItemDto.qty ?? item.qty;
    const diff = newQty - oldQty;

    const updatedItem = await this.prisma.inventoryItem.update({
      where: { id },
      data: updateInventoryItemDto,
      include: {
        material: {
          include: {
            category: true
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

    // Crear log si hay cambio en la cantidad
    if (diff !== 0) {
      await this.prisma.inventoryLog.create({
        data: {
          inventoryItemId: id,
          diff,
          reason: updateInventoryItemDto.reason || 'Actualización de inventario',
          userId
        }
      });
    }

    return updatedItem;
  }

  async remove(id: string) {
    const item = await this.findOne(id);
    
    return this.prisma.inventoryItem.delete({
      where: { id }
    });
  }

  async getLowStockItems() {
    return this.prisma.inventoryItem.findMany({
      where: {
        qty: {
          lte: this.prisma.inventoryItem.fields.minStock
        }
      },
      include: {
        material: {
          include: {
            category: true
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
      orderBy: [
        { qty: 'asc' },
        { material: { name: 'asc' } }
      ]
    });
  }

  async getExpiredItems() {
    const now = new Date();
    
    return this.prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          lt: now
        }
      },
      include: {
        material: {
          include: {
            category: true
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
      orderBy: [
        { expiryDate: 'asc' },
        { material: { name: 'asc' } }
      ]
    });
  }

  async getExpiringItems(days: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return this.prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          gte: now,
          lte: futureDate
        }
      },
      include: {
        material: {
          include: {
            category: true
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
      orderBy: [
        { expiryDate: 'asc' },
        { material: { name: 'asc' } }
      ]
    });
  }

  async getInventoryStats() {
    const total = await this.prisma.inventoryItem.count();
    const lowStock = await this.prisma.inventoryItem.count({
      where: {
        qty: {
          lte: this.prisma.inventoryItem.fields.minStock
        }
      }
    });
    const expired = await this.prisma.inventoryItem.count({
      where: {
        expiryDate: {
          lt: new Date()
        }
      }
    });
    const expiring = await this.prisma.inventoryItem.count({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
        }
      }
    });

    const byAmbulance = await this.prisma.inventoryItem.groupBy({
      by: ['ambulanceId'],
      _count: {
        ambulanceId: true
      },
      _sum: {
        qty: true
      }
    });

    const byMaterial = await this.prisma.inventoryItem.groupBy({
      by: ['materialId'],
      _count: {
        materialId: true
      },
      _sum: {
        qty: true
      }
    });

    return {
      total,
      lowStock,
      expired,
      expiring,
      byAmbulance: byAmbulance.map(item => ({
        ambulanceId: item.ambulanceId,
        count: item._count.ambulanceId,
        totalQty: item._sum.qty
      })),
      byMaterial: byMaterial.map(item => ({
        materialId: item.materialId,
        count: item._count.materialId,
        totalQty: item._sum.qty
      }))
    };
  }

  async getInventoryLogs(itemId: string) {
    return this.prisma.inventoryLog.findMany({
      where: { inventoryItemId: itemId },
      include: {
        inventoryItem: {
          include: {
            material: true,
            ambulance: {
              select: {
                id: true,
                code: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
