import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        passwordHash: hashedPassword,
      },
      include: {
        assignedAmbulance: true,
      },
    });

    // Log user creation
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        tableName: 'User',
        recordId: user.id,
        payload: { email: user.email, role: user.role },
      },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async findAll(role?: Role) {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : undefined,
      include: {
        assignedAmbulance: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => {
      const { passwordHash, ...result } = user;
      return result;
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        assignedAmbulance: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Check if email is being changed and if it's already taken
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (emailExists) {
        throw new BadRequestException('El email ya está registrado');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      include: {
        assignedAmbulance: true,
      },
    });

    // Log user update
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'User',
        recordId: user.id,
        payload: updateUserDto as any,
      },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    await this.prisma.user.delete({
      where: { id },
    });

    // Log user deletion
    await this.prisma.auditLog.create({
      data: {
        action: 'DELETE',
        tableName: 'User',
        recordId: id,
        payload: { email: user.email, role: user.role },
      },
    });

    return { message: 'Usuario eliminado correctamente' };
  }

  async assignAmbulance(userId: string, ambulanceId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id: ambulanceId },
    });

    if (!ambulance) {
      throw new NotFoundException('Ambulancia no encontrada');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { assignedAmbulanceId: ambulanceId },
      include: {
        assignedAmbulance: true,
      },
    });

    // Log assignment
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'User',
        recordId: userId,
        payload: { 
          field: 'assignedAmbulanceId', 
          oldValue: user.assignedAmbulanceId, 
          newValue: ambulanceId 
        },
      },
    });

    const { passwordHash, ...result } = updatedUser;
    return result;
  }

  async unassignAmbulance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { assignedAmbulanceId: null },
      include: {
        assignedAmbulance: true,
      },
    });

    // Log unassignment
    await this.prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        tableName: 'User',
        recordId: userId,
        payload: { 
          field: 'assignedAmbulanceId', 
          oldValue: user.assignedAmbulanceId, 
          newValue: null 
        },
      },
    });

    const { passwordHash, ...result } = updatedUser;
    return result;
  }
}
