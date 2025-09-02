import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMaterialDto } from './dto/create-material.dto';
import { UpdateMaterialDto } from './dto/update-material.dto';
import { CreateMaterialCategoryDto } from './dto/create-material-category.dto';
import { UpdateMaterialCategoryDto } from './dto/update-material-category.dto';

@Injectable()
export class MaterialsService {
  constructor(private prisma: PrismaService) {}

  // Material Categories
  async createCategory(createCategoryDto: CreateMaterialCategoryDto) {
    return this.prisma.materialCategory.create({
      data: createCategoryDto,
      include: {
        _count: {
          select: { materials: true }
        }
      }
    });
  }

  async findAllCategories() {
    return this.prisma.materialCategory.findMany({
      include: {
        _count: {
          select: { materials: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findCategoryById(id: string) {
    const category = await this.prisma.materialCategory.findUnique({
      where: { id },
      include: {
        materials: {
          include: {
            _count: {
              select: { items: true }
            }
          }
        }
      }
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  async updateCategory(id: string, updateCategoryDto: UpdateMaterialCategoryDto) {
    const category = await this.findCategoryById(id);
    
    return this.prisma.materialCategory.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        _count: {
          select: { materials: true }
        }
      }
    });
  }

  async removeCategory(id: string) {
    const category = await this.findCategoryById(id);
    
    // Verificar si hay materiales usando esta categoría
    const materialsCount = await this.prisma.material.count({
      where: { categoryId: id }
    });

    if (materialsCount > 0) {
      throw new BadRequestException('No se puede eliminar una categoría que está siendo usada por materiales');
    }

    return this.prisma.materialCategory.delete({
      where: { id }
    });
  }

  // Materials
  async create(createMaterialDto: CreateMaterialDto) {
    // Si se especifica una categoría, verificar que existe
    if (createMaterialDto.categoryId) {
      const category = await this.prisma.materialCategory.findUnique({
        where: { id: createMaterialDto.categoryId }
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    return this.prisma.material.create({
      data: createMaterialDto,
      include: {
        category: true,
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async findAll(filters?: {
    categoryId?: string;
    critical?: boolean;
    search?: string;
  }) {
    const where: any = {};

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.critical !== undefined) {
      where.critical = filters.critical;
    }

    if (filters?.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive'
      };
    }

    return this.prisma.material.findMany({
      where,
      include: {
        category: true,
        _count: {
          select: { items: true }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    const material = await this.prisma.material.findUnique({
      where: { id },
      include: {
        category: true,
        items: {
          include: {
            ambulance: {
              select: {
                id: true,
                code: true,
                name: true,
                plate: true
              }
            }
          }
        },
        _count: {
          select: { items: true }
        }
      }
    });

    if (!material) {
      throw new NotFoundException('Material no encontrado');
    }

    return material;
  }

  async update(id: string, updateMaterialDto: UpdateMaterialDto) {
    const material = await this.findOne(id);
    
    // Si se especifica una categoría, verificar que existe
    if (updateMaterialDto.categoryId) {
      const category = await this.prisma.materialCategory.findUnique({
        where: { id: updateMaterialDto.categoryId }
      });

      if (!category) {
        throw new NotFoundException('Categoría no encontrada');
      }
    }

    return this.prisma.material.update({
      where: { id },
      data: updateMaterialDto,
      include: {
        category: true,
        _count: {
          select: { items: true }
        }
      }
    });
  }

  async remove(id: string) {
    const material = await this.findOne(id);
    
    // Verificar si hay items de inventario usando este material
    const itemsCount = await this.prisma.inventoryItem.count({
      where: { materialId: id }
    });

    if (itemsCount > 0) {
      throw new BadRequestException('No se puede eliminar un material que está siendo usado en el inventario');
    }

    return this.prisma.material.delete({
      where: { id }
    });
  }

  async getMaterialStats() {
    const total = await this.prisma.material.count();
    const critical = await this.prisma.material.count({
      where: { critical: true }
    });
    const withInventory = await this.prisma.material.count({
      where: {
        items: {
          some: {}
        }
      }
    });

    const byCategory = await this.prisma.material.groupBy({
      by: ['categoryId'],
      _count: {
        categoryId: true
      }
    });

    const topUsed = await this.prisma.material.findMany({
      include: {
        category: true,
        _count: {
          select: { items: true }
        }
      },
      orderBy: {
        items: {
          _count: 'desc'
        }
      },
      take: 10
    });

    return {
      total,
      critical,
      withInventory,
      byCategory: byCategory.map(item => ({
        categoryId: item.categoryId,
        count: item._count.categoryId
      })),
      topUsed: topUsed.map(material => ({
        id: material.id,
        name: material.name,
        category: material.category?.name,
        usageCount: material._count.items
      }))
    };
  }

  async searchMaterials(query: string) {
    return this.prisma.material.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive'
        }
      },
      include: {
        category: true
      },
      take: 20,
      orderBy: { name: 'asc' }
    });
  }
}
