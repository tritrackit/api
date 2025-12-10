"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsModule = void 0;
const common_1 = require("@nestjs/common");
const statistics_controller_1 = require("./statistics.controller");
const metadata_controller_1 = require("../meta-data/metadata.controller");
const typeorm_1 = require("@nestjs/typeorm");
const Units_1 = require("../../db/entities/Units");
const UnitLogs_1 = require("../../db/entities/UnitLogs");
const Locations_1 = require("../../db/entities/Locations");
const Status_1 = require("../../db/entities/Status");
const Model_1 = require("../../db/entities/Model");
const statistics_service_1 = require("../../services/statistics.service");
let StatisticsModule = class StatisticsModule {
};
StatisticsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                Units_1.Units,
                UnitLogs_1.UnitLogs,
                Locations_1.Locations,
                Status_1.Status,
                Model_1.Model
            ])
        ],
        controllers: [statistics_controller_1.StatisticsController, metadata_controller_1.MetadataController],
        providers: [statistics_service_1.StatisticsService],
        exports: [statistics_service_1.StatisticsService, typeorm_1.TypeOrmModule],
    })
], StatisticsModule);
exports.StatisticsModule = StatisticsModule;
//# sourceMappingURL=statistics.module.js.map