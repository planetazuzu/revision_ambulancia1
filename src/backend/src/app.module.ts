import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AmbulancesModule } from './ambulances/ambulances.module';
import { MaterialsModule } from './materials/materials.module';
import { InventoryModule } from './inventory/inventory.module';
import { ChecklistsModule } from './checklists/checklists.module';
import { IncidentsModule } from './incidents/incidents.module';
import { ReportsModule } from './reports/reports.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { AmpularioModule } from './ampulario/ampulario.module';
import { USVBModule } from './usvb/usvb.module';
import { JobsModule } from './jobs/jobs.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    AmbulancesModule,
    MaterialsModule,
    InventoryModule,
    ChecklistsModule,
    IncidentsModule,
    ReportsModule,
    NotificationsModule,
    AuditModule,
    AmpularioModule,
    USVBModule,
    JobsModule,
    WebSocketModule,
  ],
})
export class AppModule {}
