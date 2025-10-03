import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAmbulanceDto } from './dto/create-ambulance.dto';
import { UpdateAmbulanceDto } from './dto/update-ambulance.dto';
import { AmbulanceType } from '@prisma/client';

@Injectable()
export class AmbulancesService {
  constructor(private prisma: PrismaService) {}

  async create(createAmbulanceDto: CreateAmbulanceDto) {
    // Check if code already exists
    const existingAmbulance = await this.prisma.ambulance.findUnique({
      where: { code: createAmbulanceDto.code },
    });

    if (existingAmbulance) {
      throw new BadRequestException('El código de ambulancia ya existe');
    }

    // Check if plate already exists
    const existingPlate = await this.prisma.ambulance.findUnique({
      where: { plate: createAmbulanceDto.plate },
    });

    if (existingPlate) {
      throw new BadRequestException('La matrícula ya está registrada');
    }

    const ambulance = await this.prisma.ambulance.create({
      data: createAmbulanceDto,
      include: {
        assignedUsers: true,
        inventoryItems: {
          include: {
            material: true,
          },
        },
      },
    });

    // Log ambulance creation
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        tableName: 'Ambulance',
        recordId: ambulance.id,
        payload: { code: ambulance.code, plate: ambulance.plate, type: ambulance.type },
      },
    });

    return ambulance;
  }

  async findAll() {
    return this.prisma.ambulance.findMany({
      include: {
        assignedUsers: true,
        inventoryItems: {
          include: {
            material: true,
          },
        },
        _count: {
          select: {
            checklists: true,
            incidents: true,
          },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(id: string) {
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id },
      include: {
        assignedUsers: true,
        inventoryItems: {
          include: {
            material: true,
          },
        },
        checklists: {
          include: {
            user: true,
            template: true,
          },
          orderBy: { date: 'desc' },
          take: 10,
        },
        incidents: {
          include: {
            responsible: true,
            inventoryItem: {
              include: {
                material: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!ambulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    return ambulance;
  }

  async update(id: string, updateAmbulanceDto: UpdateAmbulanceDto) {
    const existingAmbulance = await this.prisma.ambulance.findUnique({
      where: { id },
    });

    if (!existingAmbulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    // Check if code is being changed and if it's already taken
    if (updateAmbulanceDto.code && updateAmbulanceDto.code !== existingAmbulance.code) {
      const codeExists = await this.prisma.ambulance.findUnique({
        where: { code: updateAmbulanceDto.code },
      });

      if (codeExists) {
        throw new BadRequestException('El código de ambulancia ya existe');
      }
    }

    // Check if plate is being changed and if it's already taken
    if (updateAmbulanceDto.plate && updateAmbulanceDto.plate !== existingAmbulance.plate) {
      const plateExists = await this.prisma.ambulance.findUnique({
        where: { plate: updateAmbulanceDto.plate },
      });

      if (plateExists) {
        throw new BadRequestException('La matrícula ya está registrada');
      }
    }

    const ambulance = await this.prisma.ambulance.update({
      where: { id },
      data: updateAmbulanceDto,
      include: {
        assignedUsers: true,
        inventoryItems: {
          include: {
            material: true,
          },
        },
      },
    });

    // Log ambulance update
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'Ambulance',
        recordId: ambulance.id,
        payload: updateAmbulanceDto as any,
      },
    });

    return ambulance;
  }

  async remove(id: string) {
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id },
    });

    if (!ambulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    await this.prisma.ambulance.delete({
      where: { id },
    });

    // Log ambulance deletion
    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        tableName: 'Ambulance',
        recordId: id,
        payload: { code: ambulance.code, plate: ambulance.plate },
      },
    });

    return { message: 'Ambulancia eliminada correctamente' };
  }

  async updateCheckInDetails(id: string, kilometers: number, userId: string) {
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id },
    });

    if (!ambulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    const updatedAmbulance = await this.prisma.ambulance.update({
      where: { id },
      data: {
        lastKnownKilometers: kilometers,
        lastCheckInByUserId: userId,
        lastCheckInDate: new Date(),
      },
    });

    // Log check-in
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'UPDATE',
        tableName: 'Ambulance',
        recordId: id,
        payload: { 
          field: 'checkIn', 
          kilometers, 
          checkInDate: new Date() 
        },
      },
    });

    return updatedAmbulance;
  }

  async updateWorkflowStep(id: string, step: string, status: boolean) {
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id },
    });

    if (!ambulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    const updateData: any = {};

    switch (step) {
      case 'dailyCheck':
        updateData.dailyCheckCompleted = status;
        if (status) {
          updateData.lastDailyCheck = new Date();
        } else {
          // Reset other steps if daily check is not completed
          updateData.mechanicalReviewCompleted = false;
          updateData.cleaningCompleted = false;
          updateData.inventoryCompleted = false;
        }
        break;
      case 'mechanical':
        updateData.mechanicalReviewCompleted = status;
        if (status) {
          updateData.lastMechanicalReview = new Date();
        } else {
          // Reset subsequent steps
          updateData.cleaningCompleted = false;
          updateData.inventoryCompleted = false;
        }
        break;
      case 'cleaning':
        updateData.cleaningCompleted = status;
        if (status) {
          updateData.lastCleaning = new Date();
        } else {
          // Reset subsequent steps
          updateData.inventoryCompleted = false;
        }
        break;
      case 'inventory':
        updateData.inventoryCompleted = status;
        if (status) {
          updateData.lastInventoryCheck = new Date();
          // Reset all steps for next cycle
          updateData.dailyCheckCompleted = false;
          updateData.mechanicalReviewCompleted = false;
          updateData.cleaningCompleted = false;
        }
        break;
      default:
        throw new BadRequestException('Paso de flujo inválido');
    }

    const updatedAmbulance = await this.prisma.ambulance.update({
      where: { id },
      data: updateData,
    });

    // Log workflow step update
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'Ambulance',
        recordId: id,
        payload: { 
          field: 'workflowStep', 
          step, 
          status,
          timestamp: new Date()
        },
      },
    });

    return updatedAmbulance;
  }

  async getAmbulanceStatus(id: string) {
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id },
      include: {
        inventoryItems: {
          where: {
            OR: [
              { status: 'EXPIRED' },
              { status: 'LOW' },
            ],
          },
          include: {
            material: true,
          },
        },
        incidents: {
          where: {
            status: {
              in: ['OPEN', 'IN_PROGRESS'],
            },
          },
        },
      },
    });

    if (!ambulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    const status = {
      ambulance,
      workflow: {
        dailyCheck: ambulance.dailyCheckCompleted,
        mechanical: ambulance.mechanicalReviewCompleted,
        cleaning: ambulance.cleaningCompleted,
        inventory: ambulance.inventoryCompleted,
      },
      alerts: {
        expiredMaterials: ambulance.inventoryItems.filter(item => item.status === 'EXPIRED').length,
        lowStockItems: ambulance.inventoryItems.filter(item => item.status === 'LOW').length,
        openIncidents: ambulance.incidents.length,
      },
    };

    return status;
  }
}
