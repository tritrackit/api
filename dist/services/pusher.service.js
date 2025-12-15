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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PusherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const rfid_gateway_1 = require("../gateways/rfid.gateway");
const Pusher = require("pusher");
let PusherService = PusherService_1 = class PusherService {
    constructor(config, httpService, rfidGateway) {
        var _a, _b;
        this.config = config;
        this.httpService = httpService;
        this.rfidGateway = rfidGateway;
        this.logger = new common_1.Logger(PusherService_1.name);
        this.batchQueue = new Map();
        this.batchTimers = new Map();
        this.BATCH_DELAY_MS = 10;
        const appId = this.config.get("PUSHER_APPID");
        const key = this.config.get("PUSHER_KEY");
        const secret = this.config.get("PUSHER_SECRET");
        const cluster = this.config.get("PUSHER_CLUSTER");
        const useTLS = (_b = (_a = this.config
            .get("PUSHER_USE_TLS")) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("true")) !== null && _b !== void 0 ? _b : true;
        if (!appId || !key || !secret || !cluster) {
            this.logger.warn("Pusher configuration is incomplete. Real-time updates may not work. " +
                "Please set PUSHER_APPID, PUSHER_KEY, PUSHER_SECRET, and PUSHER_CLUSTER environment variables.");
        }
        this.pusher = new Pusher({
            appId,
            key,
            secret,
            cluster,
            useTLS: true,
            enabledTransports: ['ws', 'wss'],
            disableStats: true,
            activityTimeout: 60000,
            pongTimeout: 30000
        });
        this.logger.log(`Pusher initialized for cluster: ${cluster} (WebSocket optimized)`);
    }
    async trigger(channel, event, data) {
        try {
            await this.pusher.trigger(channel, event, data);
        }
        catch (error) {
            this.logger.error(`Pusher trigger failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    triggerAsync(channel, event, data) {
        const startTime = Date.now();
        const payload = Object.assign(Object.assign({}, data), { _pusherSentAt: startTime });
        this.pusher.trigger(channel, event, payload)
            .then(() => {
            const latency = Date.now() - startTime;
            this.logger.debug(`⚡ Pusher ${channel}/${event}: ${latency}ms`);
            if (latency > 500) {
                this.logger.warn(`⚠️ Slow Pusher: ${latency}ms for ${channel}/${event}`);
            }
        })
            .catch((error) => {
            const latency = Date.now() - startTime;
            this.logger.error(`Pusher async trigger failed: ${error.message} (${latency}ms)`, error.stack);
            this.logger.error(`Pusher error details - Channel: ${channel}, Event: ${event}, Data keys: ${Object.keys(data || {}).join(', ')}`);
            if (error.response) {
                this.logger.error(`Pusher API response: ${JSON.stringify(error.response)}`);
            }
        });
    }
    reSync(type, data, urgent = false) {
        var _a, _b, _c, _d;
        try {
            if (urgent || (data === null || data === void 0 ? void 0 : data.rfid) || ((_a = data === null || data === void 0 ? void 0 : data.action) === null || _a === void 0 ? void 0 : _a.includes('RFID')) || ((_b = data === null || data === void 0 ? void 0 : data.action) === null || _b === void 0 ? void 0 : _b.includes('REGISTER')) || (data === null || data === void 0 ? void 0 : data.action) === 'RFID_DETECTED') {
                this.logger.debug(`⚡ Routing RFID event through emergency channel: ${(data === null || data === void 0 ? void 0 : data.action) || 'RFID event'}`);
                this.sendRegistrationUrgent(Object.assign({ rfid: data.rfid, scannerCode: data.scannerCode, location: ((_c = data.location) === null || _c === void 0 ? void 0 : _c.name) || data.location, locationId: ((_d = data.location) === null || _d === void 0 ? void 0 : _d.locationId) || data.locationId, action: data.action || 'RFID_DETECTED', timestamp: data.timestamp || new Date() }, data));
                return;
            }
            const batchKey = type;
            const rfid = (data === null || data === void 0 ? void 0 : data.rfid) || 'general';
            if (!this.batchQueue.has(batchKey)) {
                this.batchQueue.set(batchKey, new Map());
            }
            const queue = this.batchQueue.get(batchKey);
            queue.set(rfid, {
                type,
                data,
                timestamp: Date.now(),
                rfid
            });
            if (this.batchTimers.has(batchKey)) {
                clearTimeout(this.batchTimers.get(batchKey));
            }
            const timer = setTimeout(() => {
                this.flushBatch(batchKey);
            }, this.BATCH_DELAY_MS);
            this.batchTimers.set(batchKey, timer);
        }
        catch (ex) {
            this.logger.error(`reSync failed: ${ex.message}`, ex.stack);
        }
    }
    flushBatch(batchKey) {
        const queue = this.batchQueue.get(batchKey);
        if (!queue || queue.size === 0) {
            this.batchQueue.delete(batchKey);
            this.batchTimers.delete(batchKey);
            return;
        }
        const events = Array.from(queue.values());
        if (events.length === 1) {
            const event = events[0];
            this.triggerAsync("all", "reSync", { type: event.type, data: event.data });
        }
        else {
            const batchedData = {
                action: 'BATCH_UPDATE',
                updates: events.map(e => e.data),
                count: events.length,
                timestamp: new Date()
            };
            this.triggerAsync("all", "reSync", { type: events[0].type, data: batchedData });
            this.logger.debug(`Batched ${events.length} ${batchKey} events (${events.length} unique RFIDs) into single update`);
        }
        this.batchQueue.delete(batchKey);
        this.batchTimers.delete(batchKey);
    }
    async reSyncAwait(type, data) {
        try {
            await this.trigger("all", "reSync", { type, data });
        }
        catch (ex) {
            this.logger.error(`reSyncAwait failed: ${ex.message}`, ex.stack);
            throw ex;
        }
    }
    sendTriggerRegister(employeeUserCode, data) {
        try {
            if (!employeeUserCode) {
                this.logger.warn(`sendTriggerRegister: employeeUserCode is missing, cannot send event for RFID: ${data.rfid}`);
                return;
            }
            const channel = `scanner-${employeeUserCode}`;
            this.logger.debug(`Sending registration event to channel: ${channel}, RFID: ${data.rfid}`);
            this.triggerAsync(channel, "scanner", { data });
        }
        catch (ex) {
            this.logger.error(`sendTriggerRegister failed: ${ex.message}`, ex.stack);
        }
    }
    async sendRegistrationEventImmediate(data) {
        var _a, _b, _c, _d, _e;
        try {
            const startTime = Date.now();
            this.logger.debug(`⚡ Sending IMMEDIATE registration event for RFID: ${data.rfid}`);
            const registrationPayload = {
                rfid: data.rfid,
                scannerCode: data.scannerCode,
                timestamp: data.timestamp instanceof Date ? data.timestamp : new Date(data.timestamp || Date.now()),
                location: ((_a = data.location) === null || _a === void 0 ? void 0 : _a.name) || ((_b = data.location) === null || _b === void 0 ? void 0 : _b.name) || 'Unknown',
                locationId: ((_c = data.location) === null || _c === void 0 ? void 0 : _c.locationId) || ((_d = data.location) === null || _d === void 0 ? void 0 : _d.locationId),
                scannerType: data.scannerType || 'REGISTRATION',
                _pusherSentAt: startTime
            };
            const promises = [
                this.pusher.trigger('registration-channel', 'new-registration', registrationPayload)
            ];
            if ((_e = data.employeeUser) === null || _e === void 0 ? void 0 : _e.employeeUserCode) {
                const channel = `scanner-${data.employeeUser.employeeUserCode}`;
                this.logger.debug(`⚡ Sending to employee channel: ${channel}, RFID: ${data.rfid}`);
                promises.push(this.pusher.trigger(channel, "scanner", {
                    data: {
                        rfid: data.rfid,
                        scannerCode: data.scannerCode,
                        timestamp: data.timestamp,
                        employeeUser: data.employeeUser,
                        location: data.location,
                        _pusherSentAt: startTime
                    }
                }));
            }
            await Promise.all(promises);
            const latency = Date.now() - startTime;
            this.logger.debug(`⚡ Registration events sent in parallel: ${latency}ms for RFID: ${data.rfid}`);
            if (latency > 500) {
                this.logger.warn(`⚠️ Slow registration event: ${latency}ms`);
            }
        }
        catch (ex) {
            this.logger.error(`sendRegistrationEventImmediate failed: ${ex.message}`, ex.stack);
        }
    }
    sendRegistrationUrgent(data) {
        var _a, _b, _c, _d, _e;
        const startTime = Date.now();
        const requestId = `push_${startTime}_${((_a = data.rfid) === null || _a === void 0 ? void 0 : _a.substring(0, 8)) || 'unknown'}`;
        this.logger.log(`🎯 [${requestId}] sendRegistrationUrgent CALLED for RFID: ${data.rfid}`);
        this.logger.debug(`📋 [${requestId}] Payload:`, {
            rfid: data.rfid,
            scannerCode: data.scannerCode,
            action: data.action,
            location: ((_b = data.location) === null || _b === void 0 ? void 0 : _b.name) || data.location,
            locationId: data.locationId || ((_c = data.location) === null || _c === void 0 ? void 0 : _c.locationId),
            hasModelId: !!(data.modelId || data.ModelId),
            modelId: data.modelId || data.ModelId
        });
        const locationName = ((_d = data.location) === null || _d === void 0 ? void 0 : _d.name) || (typeof data.location === 'string' ? data.location : 'Unknown');
        const locationId = ((_e = data.location) === null || _e === void 0 ? void 0 : _e.locationId) || data.locationId;
        const emergencyPayload = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ rfid: data.rfid, scannerCode: data.scannerCode, location: locationName, locationId: locationId, _sentAt: startTime, _instant: true }, (data.action && { action: data.action })), (data.transactionId && { transactionId: data.transactionId })), (data.status && { status: data.status })), (data.statusId && { statusId: data.statusId })), (data.employeeUserCode && { employeeUserCode: data.employeeUserCode })), (data.scannerType && { scannerType: data.scannerType }));
        const isProduction = this.config.get('NODE_ENV') === 'production';
        const externalSocketUrl = this.config.get('EXTERNAL_SOCKET_IO_URL');
        this.logger.log(`🔍 [${requestId}] DEBUG: isProduction=${isProduction}, externalSocketUrl=${externalSocketUrl ? `SET (${externalSocketUrl.substring(0, 30)}...)` : 'NOT SET'}`);
        if (isProduction && externalSocketUrl) {
            try {
                return (0, rxjs_1.firstValueFrom)(this.httpService.post(`${externalSocketUrl}/emit`, {
                    event: 'rfid-urgent',
                    data: emergencyPayload
                }, {
                    timeout: 3000,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Source': 'tritrackit-api-vercel'
                    }
                }))
                    .then((response) => {
                    const latency = Date.now() - startTime;
                    this.logger.log(`✅ Socket.io (Railway) sent: ${latency}ms for ${data.rfid}`);
                    if (response === null || response === void 0 ? void 0 : response.data) {
                        this.logger.debug(`📊 Socket.io response: ${JSON.stringify(response.data)}`);
                    }
                    return latency;
                })
                    .catch((err) => {
                    this.logger.warn(`❌ Socket.io (Railway) failed: ${err.message} - Trying local Socket.io or Pusher`);
                    if (this.rfidGateway) {
                        try {
                            this.rfidGateway.emitRfidEvent('rfid-urgent', emergencyPayload);
                            const socketLatency = Date.now() - startTime;
                            this.logger.debug(`⚡ Socket.io (local) sent: ${socketLatency}ms for ${data.rfid}`);
                            return socketLatency;
                        }
                        catch (localErr) {
                            this.logger.warn(`Socket.io (local) failed: ${localErr.message} - Using Pusher fallback`);
                            return this.fallbackToPusher(emergencyPayload, startTime, data.rfid);
                        }
                    }
                    else {
                        return this.fallbackToPusher(emergencyPayload, startTime, data.rfid);
                    }
                });
            }
            catch (err) {
                this.logger.warn(`❌ Socket.io (Railway) setup failed: ${err.message} - Trying local Socket.io or Pusher`);
            }
        }
        if (this.rfidGateway) {
            try {
                this.rfidGateway.emitRfidEvent('rfid-urgent', emergencyPayload);
                const socketLatency = Date.now() - startTime;
                this.logger.debug(`⚡ Socket.io (local) sent: ${socketLatency}ms for ${data.rfid}`);
                return Promise.resolve(socketLatency);
            }
            catch (err) {
                this.logger.warn(`Socket.io (local) failed: ${err.message}`);
            }
        }
        if (!isProduction && externalSocketUrl) {
            try {
                return (0, rxjs_1.firstValueFrom)(this.httpService.post(`${externalSocketUrl}/emit`, {
                    event: 'rfid-urgent',
                    data: emergencyPayload
                }, {
                    timeout: 3000,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Source': 'tritrackit-api-vercel'
                    }
                }))
                    .then((response) => {
                    const latency = Date.now() - startTime;
                    this.logger.log(`✅ Socket.io (external) sent: ${latency}ms for ${data.rfid}`);
                    if (response === null || response === void 0 ? void 0 : response.data) {
                        this.logger.debug(`📊 Socket.io response: ${JSON.stringify(response.data)}`);
                    }
                    return latency;
                })
                    .catch((err) => {
                    this.logger.warn(`❌ Socket.io (external) failed: ${err.message} - Using Pusher fallback`);
                    return this.fallbackToPusher(emergencyPayload, startTime, data.rfid);
                });
            }
            catch (err) {
                this.logger.warn(`❌ Socket.io (external) setup failed: ${err.message} - Using Pusher fallback`);
                return this.fallbackToPusher(emergencyPayload, startTime, data.rfid);
            }
        }
        if (!externalSocketUrl) {
            this.logger.debug('EXTERNAL_SOCKET_IO_URL not configured, using Pusher only');
        }
        return this.fallbackToPusher(emergencyPayload, startTime, data.rfid);
    }
    fallbackToPusher(emergencyPayload, startTime, rfid) {
        this.logger.debug(`🔄 Using Pusher fallback for ${rfid}`);
        return this.pusher.trigger('rfid-emergency-bypass', 'rfid-urgent', emergencyPayload)
            .then(() => {
            const latency = Date.now() - startTime;
            const environment = this.config.get('NODE_ENV') || 'unknown';
            const cluster = this.config.get('PUSHER_CLUSTER') || 'unknown';
            if (latency > 30) {
                this.logger.warn(`⚠️ Emergency RFID latency (Pusher): ${latency}ms for ${rfid} (env: ${environment}, cluster: ${cluster})`);
            }
            else {
                this.logger.debug(`⚡ Emergency RFID sent (Pusher): ${latency}ms for ${rfid}`);
            }
            return latency;
        })
            .catch((err) => {
            const latency = Date.now() - startTime;
            const environment = this.config.get('NODE_ENV') || 'unknown';
            this.logger.error(`💥 All notification methods failed: ${err.message} (${latency}ms, env: ${environment})`);
            return latency;
        });
    }
    async sendTriggerRegisterAwait(employeeUserCode, data) {
        try {
            await this.trigger(`scanner-${employeeUserCode}`, "scanner", { data });
        }
        catch (ex) {
            this.logger.error(`sendTriggerRegisterAwait failed: ${ex.message}`, ex.stack);
            throw ex;
        }
    }
};
PusherService = PusherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Optional)()),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => rfid_gateway_1.RfidGateway))),
    __metadata("design:paramtypes", [config_1.ConfigService,
        axios_1.HttpService,
        rfid_gateway_1.RfidGateway])
], PusherService);
exports.PusherService = PusherService;
//# sourceMappingURL=pusher.service.js.map