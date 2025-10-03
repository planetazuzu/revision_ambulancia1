import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { differenceInDays } from 'date-fns';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleDailyJobs() {
    this.logger.log('🔄 Starting daily jobs...');
    
    try {
      await this.checkExpiredMaterials();
      await this.checkLowStock();
      await this.createExpiryIncidents();
      await this.createLowStockIncidents();
      await this.updateInventoryStatuses();
      
      this.logger.log('✅ Daily jobs completed successfully');
    } catch (error) {
      this.logger.error('❌ Daily jobs failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyJobs() {
    this.logger.log('🔄 Starting hourly jobs...');
    
    try {
      await this.sendExpiryWarnings();
      
      this.logger.log('✅ Hourly jobs completed successfully');
    } catch (error) {
      this.logger.error('❌ Hourly jobs failed:', error);
    }
  }

  private async checkExpiredMaterials() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredMaterials = await this.prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          lte: today,
        },
        status: {
          not: 'EXPIRED',
        },
      },
      include: {
        ambulance: true,
        material: true,
      },
    });

    for (const item of expiredMaterials) {
      await this.prisma.inventoryItem.update({
        where: { id: item.id },
        data: { status: 'EXPIRED' },
      });

      this.logger.log(`📅 Material ${item.material.name} expired in ${item.ambulance.name}`);
    }

    this.logger.log(`📅 Marked ${expiredMaterials.length} materials as expired`);
  }

  private async checkLowStock() {
    const lowStockItems = await this.prisma.inventoryItem.findMany({
      where: {
        qty: {
          lte: this.prisma.inventoryItem.fields.minStock,
        },
        minStock: {
          gt: 0,
        },
        status: {
          not: 'LOW',
        },
      },
      include: {
        ambulance: true,
        material: true,
      },
    });

    for (const item of lowStockItems) {
      await this.prisma.inventoryItem.update({
        where: { id: item.id },
        data: { status: 'LOW' },
      });

      this.logger.log(`📦 Low stock: ${item.material.name} in ${item.ambulance.name} (${item.qty}/${item.minStock})`);
    }

    this.logger.log(`📦 Marked ${lowStockItems.length} items as low stock`);
  }

  private async createExpiryIncidents() {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const itemsExpiringSoon = await this.prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          gte: today,
          lte: sevenDaysFromNow,
        },
        status: 'OK',
      },
      include: {
        ambulance: {
          include: {
            assignedUsers: true,
          },
        },
        material: true,
      },
    });

    for (const item of itemsExpiringSoon) {
      const daysUntilExpiry = differenceInDays(item.expiryDate!, today);
      
      // Check if incident already exists
      const existingIncident = await this.prisma.incident.findFirst({
        where: {
          inventoryItemId: item.id,
          type: 'EXPIRED',
          status: {
            in: ['OPEN', 'IN_PROGRESS'],
          },
        },
      });

      if (!existingIncident) {
        const severity = daysUntilExpiry <= 0 ? 'CRITICAL' : 
                        daysUntilExpiry <= 3 ? 'HIGH' : 
                        daysUntilExpiry <= 7 ? 'MEDIUM' : 'LOW';

        await this.prisma.incident.create({
          data: {
            ambulanceId: item.ambulanceId,
            inventoryItemId: item.id,
            type: 'EXPIRED',
            severity,
            title: `Material próximo a caducar: ${item.material.name}`,
            description: `El material ${item.material.name} caduca en ${daysUntilExpiry} días (${item.expiryDate?.toLocaleDateString()})`,
            status: 'OPEN',
            responsibleId: item.ambulance.assignedUsers[0]?.id,
            dueDate: new Date(today.getTime() + (daysUntilExpiry <= 3 ? 1 : 3) * 24 * 60 * 60 * 1000),
          },
        });

        // Send notification
        await this.notificationsService.sendExpiryAlert(
          item.ambulanceId,
          item.material.name,
          daysUntilExpiry,
        );
      }
    }

    this.logger.log(`🚨 Created expiry incidents for ${itemsExpiringSoon.length} items`);
  }

  private async createLowStockIncidents() {
    const lowStockItems = await this.prisma.inventoryItem.findMany({
      where: {
        qty: {
          lte: this.prisma.inventoryItem.fields.minStock,
        },
        minStock: {
          gt: 0,
        },
        status: 'LOW',
      },
      include: {
        ambulance: {
          include: {
            assignedUsers: true,
          },
        },
        material: true,
      },
    });

    for (const item of lowStockItems) {
      // Check if incident already exists
      const existingIncident = await this.prisma.incident.findFirst({
        where: {
          inventoryItemId: item.id,
          type: 'MISSING',
          status: {
            in: ['OPEN', 'IN_PROGRESS'],
          },
        },
      });

      if (!existingIncident) {
        const severity = item.qty === 0 ? 'CRITICAL' : 
                        item.qty <= item.minStock / 2 ? 'HIGH' : 'MEDIUM';

        await this.prisma.incident.create({
          data: {
            ambulanceId: item.ambulanceId,
            inventoryItemId: item.id,
            type: 'MISSING',
            severity,
            title: `Stock bajo: ${item.material.name}`,
            description: `El material ${item.material.name} tiene stock bajo. Actual: ${item.qty}, Mínimo: ${item.minStock}`,
            status: 'OPEN',
            responsibleId: item.ambulance.assignedUsers[0]?.id,
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
          },
        });

        // Send notification
        await this.notificationsService.sendLowStockAlert(
          item.ambulanceId,
          item.material.name,
          item.qty,
          item.minStock,
        );
      }
    }

    this.logger.log(`🚨 Created low stock incidents for ${lowStockItems.length} items`);
  }

  private async updateInventoryStatuses() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update expired items
    await this.prisma.inventoryItem.updateMany({
      where: {
        expiryDate: {
          lte: today,
        },
        status: {
          not: 'EXPIRED',
        },
      },
      data: {
        status: 'EXPIRED',
      },
    });

    // Update low stock items
    await this.prisma.inventoryItem.updateMany({
      where: {
        qty: {
          lte: this.prisma.inventoryItem.fields.minStock,
        },
        minStock: {
          gt: 0,
        },
        status: {
          not: 'LOW',
        },
      },
      data: {
        status: 'LOW',
      },
    });

    // Update OK items
    await this.prisma.inventoryItem.updateMany({
      where: {
        AND: [
          {
            OR: [
              { expiryDate: null },
              { expiryDate: { gt: today } },
            ],
          },
          {
            OR: [
              { minStock: 0 },
              { qty: { gt: this.prisma.inventoryItem.fields.minStock } },
            ],
          },
        ],
        status: {
          not: 'OK',
        },
      },
      data: {
        status: 'OK',
      },
    });

    this.logger.log('📊 Updated inventory statuses');
  }

  private async sendExpiryWarnings() {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const itemsExpiringSoon = await this.prisma.inventoryItem.findMany({
      where: {
        expiryDate: {
          gte: today,
          lte: threeDaysFromNow,
        },
        status: 'OK',
      },
      include: {
        ambulance: true,
        material: true,
      },
    });

    for (const item of itemsExpiringSoon) {
      const daysUntilExpiry = differenceInDays(item.expiryDate!, today);
      
      if (daysUntilExpiry <= 3) {
        await this.notificationsService.sendExpiryAlert(
          item.ambulanceId,
          item.material.name,
          daysUntilExpiry,
        );
      }
    }

    if (itemsExpiringSoon.length > 0) {
      this.logger.log(`⚠️ Sent expiry warnings for ${itemsExpiringSoon.length} items`);
    }
  }

  // Manual trigger for testing
  async triggerDailyJobs() {
    this.logger.log('🔄 Manually triggering daily jobs...');
    await this.handleDailyJobs();
  }

  async triggerHourlyJobs() {
    this.logger.log('🔄 Manually triggering hourly jobs...');
    await this.handleHourlyJobs();
  }
}
