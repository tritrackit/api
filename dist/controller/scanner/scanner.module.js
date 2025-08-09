"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScannerModule = void 0;
const common_1 = require("@nestjs/common");
const scanner_controller_1 = require("./scanner.controller");
const typeorm_1 = require("@nestjs/typeorm");
const Scanner_1 = require("../../db/entities/Scanner");
const scanner_service_1 = require("../../services/scanner.service");
const firebase_provider_module_1 = require("../../core/provider/firebase/firebase-provider.module");
let ScannerModule = class ScannerModule {
};
ScannerModule = __decorate([
    (0, common_1.Module)({
        imports: [firebase_provider_module_1.FirebaseProviderModule, typeorm_1.TypeOrmModule.forFeature([Scanner_1.Scanner])],
        controllers: [scanner_controller_1.ScannerController],
        providers: [scanner_service_1.ScannerService],
        exports: [scanner_service_1.ScannerService],
    })
], ScannerModule);
exports.ScannerModule = ScannerModule;
//# sourceMappingURL=scanner.module.js.map