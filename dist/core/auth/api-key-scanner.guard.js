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
exports.ApiKeyScannerGuard = void 0;
const common_1 = require("@nestjs/common");
const scanner_service_1 = require("../../services/scanner.service");
let ApiKeyScannerGuard = class ApiKeyScannerGuard {
    constructor(scannerService) {
        this.scannerService = scannerService;
    }
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const apiKey = req.headers["x-api-key"] || req.query["api_key"];
        if (!apiKey)
            throw new common_1.UnauthorizedException("Missing API key");
        const scanner = await this.scannerService.getByCode(apiKey);
        if (!scanner)
            throw new common_1.UnauthorizedException("Invalid API key");
        req.scanner = {
            id: scanner.scannerId,
            code: scanner.scannerCode,
            locationId: scanner["locationId"],
        };
        return true;
    }
};
ApiKeyScannerGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scanner_service_1.ScannerService])
], ApiKeyScannerGuard);
exports.ApiKeyScannerGuard = ApiKeyScannerGuard;
//# sourceMappingURL=api-key-scanner.guard.js.map