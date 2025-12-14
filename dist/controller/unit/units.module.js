"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsModule = void 0;
const common_1 = require("@nestjs/common");
const units_controller_1 = require("./units.controller");
const typeorm_1 = require("@nestjs/typeorm");
const Units_1 = require("../../db/entities/Units");
const units_service_1 = require("../../services/units.service");
const firebase_provider_module_1 = require("../../core/provider/firebase/firebase-provider.module");
const pusher_service_1 = require("../../services/pusher.service");
const api_key_scanner_guard_1 = require("../../core/auth/api-key-scanner.guard");
const scanner_service_1 = require("../../services/scanner.service");
const Scanner_1 = require("../../db/entities/Scanner");
const rfid_gateway_1 = require("../../gateways/rfid.gateway");
let UnitsModule = class UnitsModule {
};
UnitsModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_provider_module_1.FirebaseProviderModule, typeorm_1.TypeOrmModule.forFeature([Units_1.Units, Scanner_1.Scanner])],
        controllers: [units_controller_1.UnitsController],
        providers: [units_service_1.UnitsService, pusher_service_1.PusherService, scanner_service_1.ScannerService, api_key_scanner_guard_1.ApiKeyScannerGuard, rfid_gateway_1.RfidGateway],
        exports: [units_service_1.UnitsService, pusher_service_1.PusherService],
    })
], UnitsModule);
exports.UnitsModule = UnitsModule;
//# sourceMappingURL=units.module.js.map