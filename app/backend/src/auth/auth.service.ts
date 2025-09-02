import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private notificationsService: NotificationsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        assignedAmbulance: true,
      },
    });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };

    const token = this.jwtService.sign(payload);

    // Log login
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'LOGIN',
        tableName: 'User',
        recordId: user.id,
        payload: { email: user.email },
      },
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        assignedAmbulance: user.assignedAmbulance,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        name: registerDto.name,
        role: registerDto.role,
      },
    });

    // Log registration
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE',
        tableName: 'User',
        recordId: user.id,
        payload: { email: user.email, role: user.role },
      },
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'Si el email existe, se enviará un enlace de recuperación' };
    }

    // Generate reset token (in production, use a proper token system)
    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    // Send email (implement email service)
    await this.notificationsService.sendPasswordResetEmail(user.email, resetToken);

    return { message: 'Si el email existe, se enviará un enlace de recuperación' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token);
      
      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Token inválido');
      }

      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);

      const user = await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash: hashedPassword },
      });

      // Log password reset
      await this.prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: 'UPDATE',
          tableName: 'User',
          recordId: user.id,
          payload: { field: 'password', action: 'reset' },
        },
      });

      return { message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      throw new BadRequestException('Token inválido o expirado');
    }
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Log password change
    await this.prisma.auditLog.create({
      data: {
        actorId: userId,
        action: 'UPDATE',
        tableName: 'User',
        recordId: userId,
        payload: { field: 'password', action: 'change' },
      },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        assignedAmbulance: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const { passwordHash, ...result } = user;
    return result;
  }
}
