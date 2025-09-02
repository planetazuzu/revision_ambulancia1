import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUSVBKitDto } from './dto/create-usvb-kit.dto';
import { UpdateUSVBKitDto } from './dto/update-usvb-kit.dto';
import { CreateUSVBKitMaterialDto } from './dto/create-usvb-kit-material.dto';
import { UpdateUSVBKitMaterialDto } from './dto/update-usvb-kit-material.dto';

@Injectable()
export class USVBService {
  constructor(private prisma: PrismaService) {}

  // USVB Kits
  async create(createUSVBKitDto: CreateUSVBKitDto) {
    // Verificar que el número no esté en uso
    const existingKit = await this.prisma.uSVBKit.findUnique({
      where: { number: createUSVBKitDto.number }
    });

    if (existingKit) {
      throw new BadRequestException('Ya existe un kit con este número');
    }

    return this.prisma.uSVBKit.create({
      data: createUSVBKitDto,
      include: {
        materials: {
          orderBy: { name: 'asc' }
        }
      }
    });
  }

  async findAll() {
    return this.prisma.uSVBKit.findMany({
      include: {
        materials: {
          orderBy: { name: 'asc' }
        },
        _count: {
          select: { materials: true }
        }
      },
      orderBy: { number: 'asc' }
    });
  }

  async findOne(id: string) {
    const kit = await this.prisma.uSVBKit.findUnique({
      where: { id },
      include: {
        materials: {
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!kit) {
      throw new NotFoundException('Kit USVB no encontrado');
    }

    return kit;
  }

  async findByNumber(number: number) {
    const kit = await this.prisma.uSVBKit.findUnique({
      where: { number },
      include: {
        materials: {
          orderBy: { name: 'asc' }
        }
      }
    });

    if (!kit) {
      throw new NotFoundException('Kit USVB no encontrado');
    }

    return kit;
  }

  async update(id: string, updateUSVBKitDto: UpdateUSVBKitDto) {
    const kit = await this.findOne(id);
    
    // Si se está cambiando el número, verificar que no esté en uso
    if (updateUSVBKitDto.number && updateUSVBKitDto.number !== kit.number) {
      const existingKit = await this.prisma.uSVBKit.findUnique({
        where: { number: updateUSVBKitDto.number }
      });

      if (existingKit) {
        throw new BadRequestException('Ya existe un kit con este número');
      }
    }

    return this.prisma.uSVBKit.update({
      where: { id },
      data: updateUSVBKitDto,
      include: {
        materials: {
          orderBy: { name: 'asc' }
        }
      }
    });
  }

  async remove(id: string) {
    const kit = await this.findOne(id);
    
    return this.prisma.uSVBKit.delete({
      where: { id }
    });
  }

  // USVB Kit Materials
  async createMaterial(kitId: string, createMaterialDto: CreateUSVBKitMaterialDto) {
    const kit = await this.findOne(kitId);
    
    // Verificar que no exista ya un material con el mismo nombre en este kit
    const existingMaterial = await this.prisma.uSVBKitMaterial.findFirst({
      where: {
        kitId,
        name: createMaterialDto.name
      }
    });

    if (existingMaterial) {
      throw new BadRequestException('Ya existe un material con este nombre en este kit');
    }

    return this.prisma.uSVBKitMaterial.create({
      data: {
        ...createMaterialDto,
        kitId
      }
    });
  }

  async updateMaterial(id: string, updateMaterialDto: UpdateUSVBKitMaterialDto) {
    const material = await this.prisma.uSVBKitMaterial.findUnique({
      where: { id },
      include: { kit: true }
    });

    if (!material) {
      throw new NotFoundException('Material del kit no encontrado');
    }

    // Si se está cambiando el nombre, verificar que no esté en uso en el mismo kit
    if (updateMaterialDto.name && updateMaterialDto.name !== material.name) {
      const existingMaterial = await this.prisma.uSVBKitMaterial.findFirst({
        where: {
          kitId: material.kitId,
          name: updateMaterialDto.name,
          id: { not: id }
        }
      });

      if (existingMaterial) {
        throw new BadRequestException('Ya existe un material con este nombre en este kit');
      }
    }

    return this.prisma.uSVBKitMaterial.update({
      where: { id },
      data: updateMaterialDto
    });
  }

  async removeMaterial(id: string) {
    const material = await this.prisma.uSVBKitMaterial.findUnique({
      where: { id }
    });

    if (!material) {
      throw new NotFoundException('Material del kit no encontrado');
    }

    return this.prisma.uSVBKitMaterial.delete({
      where: { id }
    });
  }

  async updateMaterialQuantity(id: string, newQuantity: number) {
    const material = await this.prisma.uSVBKitMaterial.findUnique({
      where: { id }
    });

    if (!material) {
      throw new NotFoundException('Material del kit no encontrado');
    }

    // Determinar el estado basado en la cantidad
    let status = 'ok';
    if (newQuantity === 0) {
      status = 'out';
    } else if (newQuantity < material.targetQuantity * 0.2) { // Menos del 20% del target
      status = 'low';
    }

    return this.prisma.uSVBKitMaterial.update({
      where: { id },
      data: {
        quantity: newQuantity,
        status
      }
    });
  }

  async getKitStatus(kitId: string) {
    const kit = await this.findOne(kitId);
    
    const materials = await this.prisma.uSVBKitMaterial.findMany({
      where: { kitId }
    });

    const totalMaterials = materials.length;
    const lowStockMaterials = materials.filter(m => m.status === 'low').length;
    const outOfStockMaterials = materials.filter(m => m.status === 'out').length;
    const okMaterials = materials.filter(m => m.status === 'ok').length;

    let overallStatus = 'ok';
    if (outOfStockMaterials > 0) {
      overallStatus = 'critical';
    } else if (lowStockMaterials > 0) {
      overallStatus = 'warning';
    }

    return {
      kit,
      status: {
        overall: overallStatus,
        totalMaterials,
        okMaterials,
        lowStockMaterials,
        outOfStockMaterials
      }
    };
  }

  async getLowStockKits() {
    const kits = await this.prisma.uSVBKit.findMany({
      include: {
        materials: true
      }
    });

    return kits.filter(kit => {
      const hasLowStock = kit.materials.some(material => 
        material.status === 'low' || material.status === 'out'
      );
      return hasLowStock;
    }).map(kit => ({
      ...kit,
      lowStockCount: kit.materials.filter(m => m.status === 'low' || m.status === 'out').length
    }));
  }

  async getStats() {
    const totalKits = await this.prisma.uSVBKit.count();
    const totalMaterials = await this.prisma.uSVBKitMaterial.count();
    
    const lowStockMaterials = await this.prisma.uSVBKitMaterial.count({
      where: { status: 'low' }
    });
    
    const outOfStockMaterials = await this.prisma.uSVBKitMaterial.count({
      where: { status: 'out' }
    });

    const kitsWithIssues = await this.getLowStockKits();

    return {
      totalKits,
      totalMaterials,
      lowStockMaterials,
      outOfStockMaterials,
      kitsWithIssues: kitsWithIssues.length,
      kits: kitsWithIssues
    };
  }
}
