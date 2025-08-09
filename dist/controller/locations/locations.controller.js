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
exports.LocationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_constant_1 = require("../../common/constant/api-response.constant");
const locations_create_dto_1 = require("../../core/dto/locations/locations.create.dto");
const locations_update_dto_1 = require("../../core/dto/locations/locations.update.dto");
const locations_service_1 = require("../../services/locations.service");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const get_user_decorator_1 = require("../../core/auth/get-user.decorator");
let LocationsController = class LocationsController {
    constructor(locationsService) {
        this.locationsService = locationsService;
    }
    async getById(locationsId) {
        const res = {};
        try {
            res.data = await this.locationsService.getById(locationsId);
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
            res.data = await this.locationsService.getPagination(params);
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
            res.data = await this.locationsService.create(accessDto, userId);
            res.success = true;
            res.message = `Locations ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async update(locationsId, dto, userId) {
        const res = {};
        try {
            res.data = await this.locationsService.update(locationsId, dto, userId);
            res.success = true;
            res.message = `Locations ${api_response_constant_1.UPDATE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async delete(locationsId, userId) {
        const res = {};
        try {
            res.data = await this.locationsService.delete(locationsId, userId);
            res.success = true;
            res.message = `Locations ${api_response_constant_1.DELETE_SUCCESS}`;
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
    (0, common_1.Get)("/:locationsId"),
    __param(0, (0, common_1.Param)("locationsId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)("/page"),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                pageSize: { type: "number", example: 10 },
                pageIndex: { type: "number", example: 0 },
                order: { type: "object", default: { lastUpdatedAt: "ASC" } },
                columnDef: { type: "array", default: [] },
            },
            required: ["pageSize", "pageIndex", "order", "columnDef"],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getPaginated", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [locations_create_dto_1.CreateLocationsDto, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)("/:locationsId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("locationsId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, locations_update_dto_1.UpdateLocationsDto, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("/:locationsId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("locationsId")),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "delete", null);
LocationsController = __decorate([
    (0, swagger_1.ApiTags)("locations"),
    (0, common_1.Controller)("locations"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
exports.LocationsController = LocationsController;
//# sourceMappingURL=locations.controller.js.map