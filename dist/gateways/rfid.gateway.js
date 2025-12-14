"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RfidGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RfidGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const common_1 = require("@nestjs/common");
let RfidGateway = RfidGateway_1 = class RfidGateway {
    constructor() {
        this.logger = new common_1.Logger(RfidGateway_1.name);
        this.connectedClients = new Map();
        this.logger.log('⚡ Socket.io RfidGateway initialized - Ready for ultra-fast RFID events');
    }
    handleConnection(client) {
        const clientId = client.id;
        this.connectedClients.set(clientId, client);
        this.logger.debug(`Client connected: ${clientId} (Total: ${this.connectedClients.size})`);
    }
    handleDisconnect(client) {
        const clientId = client.id;
        this.connectedClients.delete(clientId);
        this.logger.debug(`Client disconnected: ${clientId} (Total: ${this.connectedClients.size})`);
    }
    emitRfidEvent(event, data) {
        const startTime = Date.now();
        const payload = Object.assign(Object.assign({}, data), { _socketSentAt: startTime, _source: 'socket.io' });
        try {
            this.server.emit(event, payload);
            const latency = Date.now() - startTime;
            if (latency > 10) {
                this.logger.warn(`⚠️ Socket.io latency: ${latency}ms for ${event}`);
            }
            else {
                this.logger.debug(`⚡ Socket.io emitted: ${latency}ms - ${event}`);
            }
        }
        catch (error) {
            this.logger.error(`Socket.io emit failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    emitToRoom(room, event, data) {
        const payload = Object.assign(Object.assign({}, data), { _socketSentAt: Date.now(), _source: 'socket.io' });
        this.server.to(room).emit(event, payload);
    }
    getConnectedClientsCount() {
        return this.connectedClients.size;
    }
};
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RfidGateway.prototype, "server", void 0);
RfidGateway = RfidGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL || '*',
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        pingTimeout: 60000,
        pingInterval: 25000,
    }),
    __metadata("design:paramtypes", [])
], RfidGateway);
exports.RfidGateway = RfidGateway;
//# sourceMappingURL=rfid.gateway.js.map