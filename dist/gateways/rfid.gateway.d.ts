import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class RfidGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    private connectedClients;
    constructor();
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitRfidEvent(event: string, data: any): void;
    emitToRoom(room: string, event: string, data: any): void;
    getConnectedClientsCount(): number;
}
