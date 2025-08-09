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
exports.ScannerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_constant_1 = require("../../common/constant/api-response.constant");
const scanner_create_dto_1 = require("../../core/dto/scanner/scanner.create.dto");
const scanner_update_dto_1 = require("../../core/dto/scanner/scanner.update.dto");
const scanner_service_1 = require("../../services/scanner.service");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const get_user_decorator_1 = require("../../core/auth/get-user.decorator");
let ScannerController = class ScannerController {
    constructor(scannerService) {
        this.scannerService = scannerService;
    }
    async getById(scannerId) {
        const res = {};
        try {
            res.data = await this.scannerService.getById(scannerId);
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async getPaginated(params = {
        pageSize: "10",
        pageIndex: "0",
        order: { name: "ASC" },
        columnDef: [],
    }) {
        const res = {};
        try {
            res.data = await this.scannerService.getPagination(params);
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async create(accessDto, userId) {
        const res = {};
        try {
            res.data = await this.scannerService.create(accessDto, userId);
            res.success = true;
            res.message = `Scanner ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async update(scannerId, dto, userId) {
        const res = {};
        try {
            res.data = await this.scannerService.update(scannerId, dto, userId);
            res.success = true;
            res.message = `Scanner ${api_response_constant_1.UPDATE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async delete(scannerId, userId) {
        const res = {};
        try {
            res.data = await this.scannerService.delete(scannerId, userId);
            res.success = true;
            res.message = `Scanner ${api_response_constant_1.DELETE_SUCCESS}`;
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
    (0, common_1.Get)("/:scannerId"),
    __param(0, (0, common_1.Param)("scannerId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScannerController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)("/page"),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                pageSize: { type: "number", example: 10 },
                pageIndex: { type: "number", example: 0 },
                order: { type: "object", default: { lastUpdatedAt: "DESC" } },
                columnDef: { type: "array", default: [] },
            },
            required: ["pageSize", "pageIndex", "order", "columnDef"],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScannerController.prototype, "getPaginated", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [scanner_create_dto_1.CreateScannerDto, String]),
    __metadata("design:returntype", Promise)
], ScannerController.prototype, "create", null);
__decorate([
    (0, common_1.Put)("/:scannerId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("scannerId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, scanner_update_dto_1.UpdateScannerDto, String]),
    __metadata("design:returntype", Promise)
], ScannerController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("/:scannerId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("scannerId")),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScannerController.prototype, "delete", null);
ScannerController = __decorate([
    (0, swagger_1.ApiTags)("scanner"),
    (0, common_1.Controller)("scanner"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [scanner_service_1.ScannerService])
], ScannerController);
exports.ScannerController = ScannerController;
//# sourceMappingURL=scanner.controller.js.map