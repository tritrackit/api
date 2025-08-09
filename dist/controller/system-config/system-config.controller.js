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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const system_config_service_1 = require("../../services/system-config.service");
let SystemConfigController = class SystemConfigController {
    constructor(systemConfigService) {
        this.systemConfigService = systemConfigService;
    }
    async getAll() {
        const res = {};
        try {
            res.data = await this.systemConfigService.getAll();
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async save(dto) {
        const res = {};
        try {
            res.data = await this.systemConfigService.save(dto);
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
};
__decorate([
    (0, common_1.Get)(""),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SystemConfigController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)(""),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                key: { type: "string" },
                value: { type: "string" },
            },
            required: ["key", "value"],
        },
    }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SystemConfigController.prototype, "save", null);
SystemConfigController = __decorate([
    (0, swagger_1.ApiTags)("system-config"),
    (0, common_1.Controller)("system-config"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [system_config_service_1.SystemConfigService])
], SystemConfigController);
exports.SystemConfigController = SystemConfigController;
//# sourceMappingURL=system-config.controller.js.map