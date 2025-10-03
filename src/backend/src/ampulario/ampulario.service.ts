import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmpularioMaterialDto } from './dto/create-ampulario-material.dto';
import { UpdateAmpularioMaterialDto } from './dto/update-ampulario-material.dto';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';

@Injectable()
export class AmpularioService {
  constructor(private prisma: PrismaService) {}

  // Spaces
  async createSpace(createSpaceDto: CreateSpaceDto) {
    return this.prisma.space.create({
      data: createSpaceDto,
      include: {
        _count: {
          select: { materials: true }
        }
      }
    });
  }

  async findAllSpaces() {
    return this.prisma.space.findMany({
      include: {
        _count: {
          select: { materials: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findSpaceById(id: string) {
    const space = await this.prisma.space.findUnique({
      where: { id },
      include: {
        materials: {
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!space) {
      throw new NotFoundException('Espacio no encontrado');
    }

    return space;
  }

  async updateSpace(id: string, updateSpaceDto: UpdateSpaceDto) {
    const space = await this.findSpaceById(id);
    
    return this.prisma.space.update({
      where: { id },
      data: updateSpaceDto,
      include: {
        _count: {
          select: { materials: true }
        }
      }
    });
  }

  async removeSpace(id: string) {
    const space = await this.findSpaceById(id);
    
    // Verificar si hay materiales en este espacio
    const materialsCount = await this.prisma.ampularioMaterial.count({
      where: { spaceId: id }
    });

    if (materialsCount > 0) {
      throw new BadRequestException('No se puede eliminar un espacio que contiene materiales');
    }

    return this.prisma.space.delete({
      where: { id }
    });
  }

  // Ampulario Materials
  async create(createAmpularioMaterialDto: CreateAmpularioMaterialDto) {
    // Verificar que el espacio existe
    const space = await this.prisma.space.findUnique({
      where: { id: createAmpularioMaterialDto.spaceId }
    });

    if (!space) {
      throw new NotFoundException('Espacio no encontrado');
    }

    return this.prisma.ampularioMaterial.create({
      data: createAmpularioMaterialDto,
      include: {
        space: true
      }
    });
  }

  async findAll(filters?: {
    spaceId?: string;
    route?: string;
    nameQuery?: string;
    expiring?: boolean;
    lowStock?: boolean;
  }) {
    const where: any = {};

    if (filters?.spaceId) {
      where.spaceId = filters.spaceId;
    }

    if (filters?.route) {
      where.route = filters.route;
    }

    if (filters?.nameQuery) {
      where.name = {
        contains: filters.nameQuery,
        mode: 'insensitive'
      };
    }

    if (filters?.expiring) {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      where.expiryDate = {
        lte: thirtyDaysFromNow,
        gte: new Date()
      };
    }

    if (filters?.lowStock) {
      where.quantity = {
        lte: this.prisma.ampularioMaterial.fields.minStockLevel
      };
    }

    return this.prisma.ampularioMaterial.findMany({
      where,
      include: {
        space: true
      },
      orderBy: [
        { space: { name: 'asc' } },
        { name: 'asc' }
      ]
    });
  }

  async findOne(id: string) {
    const material = await this.prisma.ampularioMaterial.findUnique({
      where: { id },
      include: {
        space: true
      }
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    return material;
  }

  async update(id: string, updateAmpularioMaterialDto: UpdateAmpularioMaterialDto) {
    const material = await this.findOne(id);
    
    return this.prisma.ampularioMaterial.update({
      where: { id },
      data: updateAmpularioMaterialDto,
      include: {
        space: true
      }
    });
  }

  async remove(id: string) {
    const material = await this.findOne(id);
    
    return this.prisma.ampularioMaterial.delete({
      where: { id }
    });
  }

  async getExpiredMaterials() {
    const now = new Date();
    
    return this.prisma.ampularioMaterial.findMany({
      where: {
        expiryDate: {
          lt: now
        }
      },
      include: {
        space: true
      },
      orderBy: [
        { expiryDate: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  async getExpiringMaterials(days: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return this.prisma.ampularioMaterial.findMany({
      where: {
        expiryDate: {
          gte: now,
          lte: futureDate
        }
      },
      include: {
        space: true
      },
      orderBy: [
        { expiryDate: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  async getLowStockMaterials() {
    return this.prisma.ampularioMaterial.findMany({
      where: {
        quantity: {
          lte: this.prisma.ampularioMaterial.fields.minStockLevel
        }
      },
      include: {
        space: true
      },
      orderBy: [
        { quantity: 'asc' },
        { name: 'asc' }
      ]
    });
  }

  async getAlerts(spaceId?: string) {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const where: any = {
      OR: [
        // Materiales caducados
        {
          expiryDate: {
            lt: now
          }
        },
        // Materiales próximos a caducar
        {
          expiryDate: {
            gte: now,
            lte: thirtyDaysFromNow
          }
        },
        // Stock bajo
        {
          quantity: {
            lte: this.prisma.ampularioMaterial.fields.minStockLevel
          }
        }
      ]
    };

    if (spaceId) {
      where.spaceId = spaceId;
    }

    return this.prisma.ampularioMaterial.findMany({
      where,
      include: {
        space: true
      },
      orderBy: [
        { expiryDate: 'asc' },
        { quantity: 'asc' }
      ]
    });
  }

  async getStats() {
    const total = await this.prisma.ampularioMaterial.count();
    const expired = await this.prisma.ampularioMaterial.count({
      where: {
        expiryDate: {
          lt: new Date()
        }
      }
    });
    const expiring = await this.prisma.ampularioMaterial.count({
      where: {
        expiryDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
        }
      }
    });
    const lowStock = await this.prisma.ampularioMaterial.count({
      where: {
        quantity: {
          lte: this.prisma.ampularioMaterial.fields.minStockLevel
        }
      }
    });

    const bySpace = await this.prisma.ampularioMaterial.groupBy({
      by: ['spaceId'],
      _count: {
        spaceId: true
      },
      _sum: {
        quantity: true
      }
    });

    const byRoute = await this.prisma.ampularioMaterial.groupBy({
      by: ['route'],
      _count: {
        route: true
      }
    });

    return {
      total,
      expired,
      expiring,
      lowStock,
      bySpace: bySpace.map(item => ({
        spaceId: item.spaceId,
        count: item._count.spaceId,
        totalQuantity: item._sum.quantity
      })),
      byRoute: byRoute.map(item => ({
        route: item.route,
        count: item._count.route
      }))
    };
  }

  async importFromCSV(csvData: any[], spaceId: string) {
    const space = await this.findSpaceById(spaceId);
    
    const materials = csvData.map(row => ({
      spaceId,
      name: row.name,
      dose: row.dose || null,
      unit: row.unit || null,
      quantity: parseInt(row.quantity) || 0,
      route: row.route,
      expiryDate: row.expiry_date ? new Date(row.expiry_date) : null,
      minStockLevel: parseInt(row.min_stock_level) || 0
    }));

    const results = [];
    for (const material of materials) {
      try {
        const created = await this.prisma.ampularioMaterial.create({
          data: material,
          include: {
            space: true
          }
        });
        results.push(created);
      } catch (error) {
        console.error('Error creating material:', error);
      }
    }

    return {
      imported: results.length,
      materials: results
    };
  }
}
