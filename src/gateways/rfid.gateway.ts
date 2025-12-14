import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*', // Restrict to frontend domain in production
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class RfidGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RfidGateway.name);
  private connectedClients = new Map<string, Socket>();

  constructor() {
    // Log initialization
    this.logger.log('⚡ Socket.io RfidGateway initialized - Ready for ultra-fast RFID events');
  }

  handleConnection(client: Socket) {
    const clientId = client.id;
    this.connectedClients.set(clientId, client);
    this.logger.debug(`Client connected: ${clientId} (Total: ${this.connectedClients.size})`);
  }

  handleDisconnect(client: Socket) {
    const clientId = client.id;
    this.connectedClients.delete(clientId);
    this.logger.debug(`Client disconnected: ${clientId} (Total: ${this.connectedClients.size})`);
  }

  /**
   * ⚡ ULTRA-FAST: Emit RFID event directly to all connected clients
   * Latency: <10ms (vs 500-1000ms with Pusher)
   */
  emitRfidEvent(event: string, data: any): void {
    const startTime = Date.now();
    const payload = {
      ...data,
      _socketSentAt: startTime,
      _source: 'socket.io',
    };

    try {
      this.server.emit(event, payload);
      
      const latency = Date.now() - startTime;
      if (latency > 10) {
        this.logger.warn(`⚠️ Socket.io latency: ${latency}ms for ${event}`);
      } else {
        this.logger.debug(`⚡ Socket.io emitted: ${latency}ms - ${event}`);
      }
    } catch (error) {
      this.logger.error(`Socket.io emit failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Emit to specific room (for employee-specific events)
   */
  emitToRoom(room: string, event: string, data: any): void {
    const payload = {
      ...data,
      _socketSentAt: Date.now(),
      _source: 'socket.io',
    };
    this.server.to(room).emit(event, payload);
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}

