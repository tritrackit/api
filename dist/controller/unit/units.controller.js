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
exports.UnitsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_constant_1 = require("../../common/constant/api-response.constant");
const unit_create_dto_1 = require("../../core/dto/unit/unit.create.dto");
const unit_update_dto_1 = require("../../core/dto/unit/unit.update.dto");
const units_service_1 = require("../../services/units.service");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const get_user_decorator_1 = require("../../core/auth/get-user.decorator");
const unit_logs_dto_1 = require("../../core/dto/unit/unit-logs.dto");
const api_key_scanner_guard_1 = require("../../core/auth/api-key-scanner.guard");
let UnitsController = class UnitsController {
    constructor(unitsService) {
        this.unitsService = unitsService;
    }
    async getActivityHistory(unitCode, pageSize, pageIndex) {
        const res = {};
        try {
            const size = pageSize ? Number(pageSize) : 50;
            const index = pageIndex ? Number(pageIndex) : 0;
            res.data = await this.unitsService.getActivityHistory(unitCode, size, index);
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async getByCode(unitCode) {
        const res = {};
        try {
            res.data = await this.unitsService.getByCode(unitCode);
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async getPaginated(params) {
        const res = {};
        try {
            res.data = await this.unitsService.getPagination(params);
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
            res.data = await this.unitsService.create(accessDto, userId);
            res.success = true;
            res.message = `Unit ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async update(unitCode, dto, userId) {
        const res = {};
        try {
            res.data = await this.unitsService.update(unitCode, dto, userId);
            res.success = true;
            res.message = `Unit ${api_response_constant_1.UPDATE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async delete(unitCode, userId) {
        const res = {};
        try {
            res.data = await this.unitsService.delete(unitCode, userId);
            res.success = true;
            res.message = `Unit ${api_response_constant_1.DELETE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async unitLogs(dto, req) {
        var _a;
        const res = {};
        try {
            res.data = await this.unitsService.unitLogs(dto, (_a = req.scanner) === null || _a === void 0 ? void 0 : _a.code);
            res.success = true;
            res.message = `Unit logs ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async registerUnit(dto) {
        const res = {};
        try {
            res.data = await this.unitsService.registerUnit(dto.rfid, dto.scannerCode, {
                chassisNo: dto.chassisNo,
                color: dto.color,
                description: dto.description,
                modelId: dto.modelId
            });
            res.success = true;
            res.message = `Unit ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async updateUnitLocation(dto) {
        const res = {};
        try {
            res.data = await this.unitsService.updateUnitLocation(dto.rfid, dto.scannerCode);
            res.success = true;
            res.message = "Unit location updated successfully";
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
    (0, common_1.Get)("/:unitCode/activity-history"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("unitCode")),
    __param(1, (0, common_1.Query)("pageSize")),
    __param(2, (0, common_1.Query)("pageIndex")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UnitsController.prototype, "getActivityHistory", null);
__decorate([
    (0, common_1.Get)("/:unitCode"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("unitCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UnitsController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Post)("/page"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
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
], UnitsController.prototype, "getPaginated", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [unit_create_dto_1.CreateUnitDto, String]),
    __metadata("design:returntype", Promise)
], UnitsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)("/:unitCode"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("unitCode")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, unit_update_dto_1.UpdateUnitDto, String]),
    __metadata("design:returntype", Promise)
], UnitsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("/:unitCode"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("unitCode")),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UnitsController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)("unit-logs"),
    (0, swagger_1.ApiSecurity)("apiKey"),
    (0, common_1.UseGuards)(api_key_scanner_guard_1.ApiKeyScannerGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [unit_logs_dto_1.LogsDto, Object]),
    __metadata("design:returntype", Promise)
], UnitsController.prototype, "unitLogs", null);
__decorate([
    (0, common_1.Post)("register"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                scannerCode: { type: "string", example: "REG_DESK" },
                rfid: { type: "string", example: "TEST_RFID_001" },
                chassisNo: { type: "string", example: "CH-001" },
                color: { type: "string", example: "Red" },
                description: { type: "string", example: "Test unit" },
                modelId: { type: "string", example: "1" }
            },
            required: ["scannerCode", "rfid", "chassisNo", "color", "description", "modelId"]
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UnitsController.prototype, "registerUnit", null);
__decorate([
    (0, common_1.Post)("scan-location"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                scannerCode: { type: "string", example: "WH5_ENTRY" },
                rfid: { type: "string", example: "TEST_RFID_001" }
            },
            required: ["scannerCode", "rfid"]
        }
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UnitsController.prototype, "updateUnitLocation", null);
UnitsController = __decorate([
    (0, swagger_1.ApiTags)("units"),
    (0, common_1.Controller)("units"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [units_service_1.UnitsService])
], UnitsController);
exports.UnitsController = UnitsController;
//# sourceMappingURL=units.controller.js.map