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
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_service_1 = require("./db/typeorm/typeorm.service");
const config_1 = require("@nestjs/config");
const auth_module_1 = require("./controller/auth/auth.module");
const role_module_1 = require("./controller/role/role.module");
const employee_user_module_1 = require("./controller/employee-user/employee-user.module");
const model_module_1 = require("./controller/model/model.module");
const scanner_module_1 = require("./controller/scanner/scanner.module");
const locations_module_1 = require("./controller/locations/locations.module");
const units_module_1 = require("./controller/unit/units.module");
const statistics_module_1 = require("./controller/statistics/statistics.module");
const cache_service_1 = require("./services/cache.service");
const cache_module_1 = require("./core/cache/cache.module");
const performance_middleware_1 = require("./core/middleware/performance.middleware");
const rfid_gateway_1 = require("./gateways/rfid.gateway");
let AppModule = class AppModule {
    constructor(cache) {
        this.cache = cache;
    }
    configure(consumer) {
        consumer
            .apply(performance_middleware_1.PerformanceMiddleware)
            .forRoutes('units');
    }
    onApplicationBootstrap() {
        if (process.env.NODE_ENV !== "production") {
        }
    }
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                envFilePath: [
                    `envs/${process.env.NODE_ENV || 'development'}.env`,
                    'envs/.env',
                ],
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({ useClass: typeorm_service_1.TypeOrmConfigService }),
            auth_module_1.AuthModule,
            employee_user_module_1.EmployeeUserModule,
            role_module_1.RoleModule,
            model_module_1.ModelModule,
            scanner_module_1.ScannerModule,
            locations_module_1.LocationsModule,
            units_module_1.UnitsModule,
            statistics_module_1.StatisticsModule,
            cache_module_1.CacheModule
        ],
        providers: [app_service_1.AppService, cache_service_1.CacheService, rfid_gateway_1.RfidGateway],
        controllers: [],
    }),
    __metadata("design:paramtypes", [cache_service_1.CacheService])
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map