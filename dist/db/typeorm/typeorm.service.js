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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeOrmConfigService = void 0;
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const Roles_1 = require("../entities/Roles");
const SystemConfig_1 = require("../entities/SystemConfig");
const EmployeeUsers_1 = require("../entities/EmployeeUsers");
const EmployeeUserActivityLogs_1 = require("../entities/EmployeeUserActivityLogs");
const Locations_1 = require("../entities/Locations");
const Model_1 = require("../entities/Model");
const Scanner_1 = require("../entities/Scanner");
const UnitLogs_1 = require("../entities/UnitLogs");
const Units_1 = require("../entities/Units");
const Status_1 = require("../entities/Status");
const File_1 = require("../entities/File");
let TypeOrmConfigService = class TypeOrmConfigService {
    createTypeOrmOptions() {
        var _a, _b;
        const ssl = this.config.get("SSL");
        const config = {
            type: "postgres",
            host: this.config.get("DATABASE_HOST"),
            port: Number(this.config.get("DATABASE_PORT")),
            database: this.config.get("DATABASE_NAME"),
            username: this.config.get("DATABASE_USER"),
            password: this.config.get("DATABASE_PASSWORD"),
            entities: [
                EmployeeUsers_1.EmployeeUsers,
                Roles_1.Roles,
                SystemConfig_1.SystemConfig,
                File_1.File,
                EmployeeUserActivityLogs_1.EmployeeUserActivityLogs,
                Locations_1.Locations,
                Model_1.Model,
                Scanner_1.Scanner,
                Status_1.Status,
                UnitLogs_1.UnitLogs,
                Units_1.Units,
            ],
            synchronize: false,
            ssl: (_b = (_a = ssl === null || ssl === void 0 ? void 0 : ssl.toLowerCase()) === null || _a === void 0 ? void 0 : _a.includes("true")) !== null && _b !== void 0 ? _b : false,
            extra: {
                timezone: "UTC",
            },
        };
        if (config.ssl) {
            config.extra.ssl = {
                require: true,
                rejectUnauthorized: false,
            };
        }
        return config;
    }
};
__decorate([
    (0, common_1.Inject)(config_1.ConfigService),
    __metadata("design:type", config_1.ConfigService)
], TypeOrmConfigService.prototype, "config", void 0);
TypeOrmConfigService = __decorate([
    (0, common_1.Injectable)()
], TypeOrmConfigService);
exports.TypeOrmConfigService = TypeOrmConfigService;
//# sourceMappingURL=typeorm.service.js.map