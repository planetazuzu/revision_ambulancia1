import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { TestEmailDto } from './dto/test-email.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('test-email')
  @Roles(Role.ADMIN, Role.COORDINADOR)
  @ApiOperation({ summary: 'Enviar email de prueba' })
  @ApiResponse({ status: 200, description: 'Email de prueba enviado' })
  async sendTestEmail(@Body() testEmailDto: TestEmailDto) {
    const success = await this.notificationsService.sendTestEmail(testEmailDto.email);
    return {
      success,
      message: success ? 'Email de prueba enviado correctamente' : 'Error al enviar email de prueba',
    };
  }
}
