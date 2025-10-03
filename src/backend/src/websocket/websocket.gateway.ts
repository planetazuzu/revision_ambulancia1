import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class AmbuReviewWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, { socket: Socket; userId: string; role: string }>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      this.connectedUsers.set(client.id, {
        socket: client,
        userId: payload.sub,
        role: payload.role,
      });

      // Join user to their personal room
      client.join(`user:${payload.sub}`);
      
      // Join user to ambulance room if assigned
      if (payload.assignedAmbulanceId) {
        client.join(`ambulance:${payload.assignedAmbulanceId}`);
      }

      // Join coordinators to all ambulance rooms
      if (payload.role === 'COORDINADOR' || payload.role === 'ADMIN') {
        client.join('coordinators');
      }

      console.log(`🔌 User ${payload.email} connected (${client.id})`);
      
      // Send connection confirmation
      client.emit('connected', {
        message: 'Conectado al sistema de notificaciones en tiempo real',
        userId: payload.sub,
        role: payload.role,
      });

    } catch (error) {
      console.error('❌ WebSocket connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      console.log(`🔌 User ${user.userId} disconnected (${client.id})`);
      this.connectedUsers.delete(client.id);
    }
  }

  @SubscribeMessage('join_ambulance')
  async handleJoinAmbulance(
    @MessageBody() data: { ambulanceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) {
      client.emit('error', { message: 'Usuario no autenticado' });
      return;
    }

    // Check if user has access to this ambulance
    if (user.role !== 'COORDINADOR' && user.role !== 'ADMIN') {
      // For regular users, they can only join their assigned ambulance
      // This would need to be checked against the database
    }

    client.join(`ambulance:${data.ambulanceId}`);
    client.emit('joined_ambulance', { ambulanceId: data.ambulanceId });
  }

  @SubscribeMessage('leave_ambulance')
  async handleLeaveAmbulance(
    @MessageBody() data: { ambulanceId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`ambulance:${data.ambulanceId}`);
    client.emit('left_ambulance', { ambulanceId: data.ambulanceId });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    client.emit('pong', { timestamp: new Date().toISOString() });
  }

  // Methods to send notifications to specific groups
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  sendToAmbulance(ambulanceId: string, data: any) {
    this.server.to(`ambulance:${ambulanceId}`).emit('ambulance_notification', data);
  }

  sendToCoordinators(data: any) {
    this.server.to('coordinators').emit('coordinator_notification', data);
  }

  sendToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected users by role
  getConnectedUsersByRole(role: string): number {
    return Array.from(this.connectedUsers.values()).filter(user => user.role === role).length;
  }
}
