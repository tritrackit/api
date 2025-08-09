"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemConfigModule = void 0;
const common_1 = require("@nestjs/common");
const system_config_controller_1 = require("./system-config.controller");
const SystemConfig_1 = require("../../db/entities/SystemConfig");
const typeorm_1 = require("@nestjs/typeorm");
const system_config_service_1 = require("../../services/system-config.service");
let SystemConfigModule = class SystemConfigModule {
};
SystemConfigModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([SystemConfig_1.SystemConfig])],
        controllers: [system_config_controller_1.SystemConfigController],
        providers: [system_config_service_1.SystemConfigService],
        exports: [system_config_service_1.SystemConfigService],
    })
], SystemConfigModule);
exports.SystemConfigModule = SystemConfigModule;
//# sourceMappingURL=system-config.module.js.map