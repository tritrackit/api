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
const locations_service_1 = require("../../services/locations.service");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const get_user_decorator_1 = require("../../core/auth/get-user.decorator");
let LocationsController = class LocationsController {
    constructor(locationsService) {
        this.locationsService = locationsService;
    }
    async getById(locationId) {
        const res = {};
        try {
            res.data = await this.locationsService.getById(locationId);
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
    async getAllFixedLocations() {
        const res = {};
        try {
            res.data = await this.locationsService.getAllFixedLocations();
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async createDisabled() {
        const res = {};
        res.success = false;
        res.message = "Creating locations is disabled. Locations are fixed: Open Area, Warehouse 4, Warehouse 5, Delivered.";
        res.data = null;
        return res;
    }
    async updateDisabled(locationId, dto, userId) {
        const res = {};
        res.success = false;
        res.message = "Updating locations is disabled. Locations are fixed and cannot be modified.";
        res.data = null;
        return res;
    }
    async deleteDisabled(locationId, userId) {
        const res = {};
        res.success = false;
        res.message = "Deleting locations is disabled. Locations are fixed and required for system operations.";
        res.data = null;
        return res;
    }
};
__decorate([
    (0, common_1.Get)("/:locationId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Get fixed location by ID",
        description: "Returns one of the 4 fixed locations: Open Area, Warehouse 4, Warehouse 5, or Delivered"
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns the fixed location"
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: "Location not found - must be one of the 4 fixed locations"
    }),
    __param(0, (0, common_1.Param)("locationId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getById", null);
__decorate([
    (0, common_1.Post)("/page"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Get paginated list of fixed locations",
        description: "Returns all 4 fixed locations in paginated format. Locations are predefined and cannot be created, updated, or deleted."
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                pageSize: { type: "number", example: 10 },
                pageIndex: { type: "number", example: 0 },
                order: { type: "object", default: { name: "ASC" } },
                columnDef: { type: "array", default: [] },
            },
            required: ["pageSize", "pageIndex", "order", "columnDef"],
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns paginated fixed locations (always 4 total)"
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getPaginated", null);
__decorate([
    (0, common_1.Get)("/all/fixed"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: "Get all fixed locations for dropdown",
        description: "Returns all 4 fixed locations in alphabetical order. Use for UI dropdowns."
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: "Returns array of all 4 fixed locations"
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "getAllFixedLocations", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    (0, swagger_1.ApiOperation)({
        summary: "DISABLED - Locations are fixed",
        description: "This endpoint is disabled. Locations are predefined (Open Area, Warehouse 4, Warehouse 5, Delivered) and cannot be created."
    }),
    (0, swagger_1.ApiResponse)({
        status: 410,
        description: "Gone - This endpoint is disabled"
    }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "createDisabled", null);
__decorate([
    (0, common_1.Put)("/:locationId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    (0, swagger_1.ApiOperation)({
        summary: "DISABLED - Locations are fixed",
        description: "This endpoint is disabled. Locations are predefined and cannot be updated."
    }),
    (0, swagger_1.ApiResponse)({
        status: 410,
        description: "Gone - This endpoint is disabled"
    }),
    __param(0, (0, common_1.Param)("locationId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "updateDisabled", null);
__decorate([
    (0, common_1.Delete)("/:locationId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.GONE),
    (0, swagger_1.ApiOperation)({
        summary: "DISABLED - Locations are fixed",
        description: "This endpoint is disabled. Locations are predefined and cannot be deleted."
    }),
    (0, swagger_1.ApiResponse)({
        status: 410,
        description: "Gone - This endpoint is disabled"
    }),
    __param(0, (0, common_1.Param)("locationId")),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LocationsController.prototype, "deleteDisabled", null);
LocationsController = __decorate([
    (0, swagger_1.ApiTags)("locations"),
    (0, common_1.Controller)("locations"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [locations_service_1.LocationsService])
], LocationsController);
exports.LocationsController = LocationsController;
//# sourceMappingURL=locations.controller.js.map