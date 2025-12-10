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
var PusherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const Pusher = require("pusher");
let PusherService = PusherService_1 = class PusherService {
    constructor(config) {
        var _a, _b;
        this.config = config;
        this.logger = new common_1.Logger(PusherService_1.name);
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
            useTLS,
        });
        this.logger.log(`Pusher initialized for cluster: ${cluster}`);
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
        this.pusher.trigger(channel, event, data)
            .then(() => {
            this.logger.debug(`Pusher event triggered: ${channel}/${event}`);
        })
            .catch((error) => {
            this.logger.error(`Pusher async trigger failed: ${error.message}`, error.stack);
        });
    }
    reSync(type, data) {
        try {
            this.triggerAsync("all", "reSync", { type, data });
        }
        catch (ex) {
            this.logger.error(`reSync failed: ${ex.message}`, ex.stack);
        }
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
            this.triggerAsync(`scanner-${employeeUserCode}`, "scanner", { data });
        }
        catch (ex) {
            this.logger.error(`sendTriggerRegister failed: ${ex.message}`, ex.stack);
        }
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
    __metadata("design:paramtypes", [config_1.ConfigService])
], PusherService);
exports.PusherService = PusherService;
//# sourceMappingURL=pusher.service.js.map