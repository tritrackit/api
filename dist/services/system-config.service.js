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
exports.SystemConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const SystemConfig_1 = require("../db/entities/SystemConfig");
const typeorm_2 = require("typeorm");
let SystemConfigService = class SystemConfigService {
    constructor(systemConfigRepo, config) {
        this.systemConfigRepo = systemConfigRepo;
        this.config = config;
    }
    async getAll() {
        const results = await this.systemConfigRepo.find();
        const keys = [
            "MAXIM_LOCATION_SERVICE_URL",
            "MAXIM_LOCATION_SERVICE_API_KEY",
        ];
        const values = keys.map((key) => {
            return {
                key,
                value: this.config.get(key),
            };
        });
        return [...results, ...values];
    }
    async save({ key, value }) {
        return await this.systemConfigRepo.manager.transaction(async (entityManager) => {
            const systemConfig = await entityManager.findOne(SystemConfig_1.SystemConfig, {
                where: { key },
            });
            if (!systemConfig) {
                throw new Error("No system config found");
            }
            systemConfig.value = value;
            await entityManager.save(SystemConfig_1.SystemConfig, systemConfig);
            return await entityManager.find(SystemConfig_1.SystemConfig);
        });
    }
};
SystemConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(SystemConfig_1.SystemConfig)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], SystemConfigService);
exports.SystemConfigService = SystemConfigService;
//# sourceMappingURL=system-config.service.js.map