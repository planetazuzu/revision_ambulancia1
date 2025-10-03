import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketGateway } from '../websocket/websocket.gateway';
import * as nodemailer from 'nodemailer';
import * as webpush from 'web-push';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private webSocketGateway: WebSocketGateway,
  ) {
    this.initializeEmail();
    this.initializeWebPush();
  }

  private initializeEmail() {
    this.transporter = nodemailer.createTransporter({
      host: this.configService.get<string>('SMTP_HOST'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '1025')),
      secure: false,
      auth: this.configService.get<string>('SMTP_USER') ? {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      } : undefined,
    });
  }

  private initializeWebPush() {
    const vapidPublicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const vapidEmail = this.configService.get<string>('VAPID_EMAIL');

    if (vapidPublicKey && vapidPrivateKey && vapidEmail) {
      webpush.setVapidDetails(
        vapidEmail,
        vapidPublicKey,
        vapidPrivateKey,
      );
    }
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const from = this.configService.get<string>('SMTP_FROM', 'AmbuReview <no-reply@ambureview.local>');
      
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html,
      });

      console.log(`📧 Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recuperación de Contraseña - AmbuReview</h2>
        <p>Hola,</p>
        <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
        <p><a href="${resetUrl}" style="background-color: #4A8FE7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a></p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">AmbuReview - Sistema de Gestión de Ambulancias</p>
      </div>
    `;

    return this.sendEmail(email, 'Recuperación de Contraseña - AmbuReview', html);
  }

  async sendExpiryAlert(ambulanceId: string, materialName: string, daysUntilExpiry: number) {
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      include: {
        assignedUsers: true,
      },
    });

    if (!ambulance) return;

    const severity = daysUntilExpiry <= 0 ? 'CRÍTICA' : daysUntilExpiry <= 7 ? 'ALTA' : 'MEDIA';
    const color = daysUntilExpiry <= 0 ? '#ef4444' : daysUntilExpiry <= 7 ? '#f59e0b' : '#3b82f6';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">🚨 Alerta de Caducidad - AmbuReview</h2>
        <div style="background-color: ${color}20; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Material: ${materialName}</h3>
          <p><strong>Ambulancia:</strong> ${ambulance.name} (${ambulance.plate})</p>
          <p><strong>Días hasta caducidad:</strong> ${daysUntilExpiry <= 0 ? 'CADUCADO' : daysUntilExpiry}</p>
          <p><strong>Severidad:</strong> ${severity}</p>
        </div>
        <p>Por favor, revisa y reemplaza este material lo antes posible.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">AmbuReview - Sistema de Gestión de Ambulancias</p>
      </div>
    `;

    // Send to assigned users
    for (const user of ambulance.assignedUsers) {
      if (user.email) {
        await this.sendEmail(user.email, `Alerta de Caducidad - ${ambulance.name}`, html);
      }
    }

    // Send WebSocket notification
    this.webSocketGateway.sendToAmbulance(ambulanceId, {
      type: 'EXPIRY_ALERT',
      data: {
        materialName,
        daysUntilExpiry,
        severity,
        ambulanceName: ambulance.name,
      },
    });

    // Create notification record
    await this.prisma.notification.create({
      data: {
        type: 'EMAIL',
        title: `Alerta de Caducidad - ${ambulance.name}`,
        message: `Material ${materialName} ${daysUntilExpiry <= 0 ? 'caducado' : `caduca en ${daysUntilExpiry} días`}`,
        data: {
          ambulanceId,
          materialName,
          daysUntilExpiry,
          severity,
        },
        sent: true,
        sentAt: new Date(),
      },
    });
  }

  async sendLowStockAlert(ambulanceId: string, materialName: string, currentStock: number, minStock: number) {
    const ambulance = await this.prisma.ambulance.findUnique({
      where: { id: ambulanceId },
      include: {
        assignedUsers: true,
      },
    });

    if (!ambulance) return;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e0b;">⚠️ Alerta de Stock Bajo - AmbuReview</h2>
        <div style="background-color: #f59e0b20; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Material: ${materialName}</h3>
          <p><strong>Ambulancia:</strong> ${ambulance.name} (${ambulance.plate})</p>
          <p><strong>Stock actual:</strong> ${currentStock}</p>
          <p><strong>Stock mínimo:</strong> ${minStock}</p>
        </div>
        <p>Por favor, repone este material para mantener el stock adecuado.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">AmbuReview - Sistema de Gestión de Ambulancias</p>
      </div>
    `;

    // Send to assigned users
    for (const user of ambulance.assignedUsers) {
      if (user.email) {
        await this.sendEmail(user.email, `Alerta de Stock Bajo - ${ambulance.name}`, html);
      }
    }

    // Send WebSocket notification
    this.webSocketGateway.sendToAmbulance(ambulanceId, {
      type: 'LOW_STOCK_ALERT',
      data: {
        materialName,
        currentStock,
        minStock,
        ambulanceName: ambulance.name,
      },
    });

    // Create notification record
    await this.prisma.notification.create({
      data: {
        type: 'EMAIL',
        title: `Alerta de Stock Bajo - ${ambulance.name}`,
        message: `Material ${materialName} con stock bajo (${currentStock}/${minStock})`,
        data: {
          ambulanceId,
          materialName,
          currentStock,
          minStock,
        },
        sent: true,
        sentAt: new Date(),
      },
    });
  }

  async sendIncidentAlert(incidentId: string) {
    const incident = await this.prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        ambulance: {
          include: {
            assignedUsers: true,
          },
        },
        responsible: true,
      },
    });

    if (!incident) return;

    const color = incident.severity === 'CRITICAL' ? '#ef4444' : 
                  incident.severity === 'HIGH' ? '#f59e0b' : 
                  incident.severity === 'MEDIUM' ? '#3b82f6' : '#10b981';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${color};">🚨 Nueva Incidencia - AmbuReview</h2>
        <div style="background-color: ${color}20; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${incident.title}</h3>
          <p><strong>Ambulancia:</strong> ${incident.ambulance.name} (${incident.ambulance.plate})</p>
          <p><strong>Tipo:</strong> ${incident.type}</p>
          <p><strong>Severidad:</strong> ${incident.severity}</p>
          <p><strong>Estado:</strong> ${incident.status}</p>
          ${incident.description ? `<p><strong>Descripción:</strong> ${incident.description}</p>` : ''}
          ${incident.dueDate ? `<p><strong>Fecha límite:</strong> ${incident.dueDate.toLocaleDateString()}</p>` : ''}
        </div>
        <p>Por favor, revisa y actúa sobre esta incidencia.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">AmbuReview - Sistema de Gestión de Ambulancias</p>
      </div>
    `;

    // Send to assigned users and responsible person
    const recipients = new Set([
      ...incident.ambulance.assignedUsers.map(u => u.email),
      incident.responsible?.email,
    ].filter(Boolean));

    for (const email of recipients) {
      if (email) {
        await this.sendEmail(email, `Nueva Incidencia - ${incident.ambulance.name}`, html);
      }
    }

    // Send WebSocket notification
    this.webSocketGateway.sendToAmbulance(incident.ambulanceId, {
      type: 'INCIDENT_CREATED',
      data: {
        incidentId: incident.id,
        title: incident.title,
        severity: incident.severity,
        type: incident.type,
      },
    });

    // Create notification record
    await this.prisma.notification.create({
      data: {
        type: 'EMAIL',
        title: `Nueva Incidencia - ${incident.ambulance.name}`,
        message: incident.title,
        data: {
          incidentId: incident.id,
          ambulanceId: incident.ambulanceId,
          severity: incident.severity,
        },
        sent: true,
        sentAt: new Date(),
      },
    });
  }

  async sendTestEmail(email: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>✅ Email de Prueba - AmbuReview</h2>
        <p>Este es un email de prueba para verificar que el sistema de notificaciones funciona correctamente.</p>
        <p>Si recibes este email, la configuración está funcionando bien.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">AmbuReview - Sistema de Gestión de Ambulancias</p>
      </div>
    `;

    return this.sendEmail(email, 'Email de Prueba - AmbuReview', html);
  }
}
