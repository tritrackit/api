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
exports.RoleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_constant_1 = require("../../common/constant/api-response.constant");
const get_user_decorator_1 = require("../../core/auth/get-user.decorator");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const pagination_params_dto_1 = require("../../core/dto/pagination-params.dto");
const roles_create_dto_1 = require("../../core/dto/roles/roles.create.dto");
const roles_update_dto_1 = require("../../core/dto/roles/roles.update.dto");
const roles_service_1 = require("../../services/roles.service");
let RoleController = class RoleController {
    constructor(roleService) {
        this.roleService = roleService;
    }
    async getDetails(roleCode) {
        const res = {};
        try {
            res.data = await this.roleService.getByCode(roleCode);
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
            res.data = await this.roleService.getPagination(params);
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
            res.data = await this.roleService.create(accessDto, userId);
            res.success = true;
            res.message = `Role ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async update(roleCode, dto, userId) {
        const res = {};
        try {
            res.data = await this.roleService.update(roleCode, dto, userId);
            res.success = true;
            res.message = `Role ${api_response_constant_1.UPDATE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async delete(roleCode, userId) {
        const res = {};
        try {
            res.data = await this.roleService.delete(roleCode, userId);
            res.success = true;
            res.message = `Role ${api_response_constant_1.DELETE_SUCCESS}`;
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
    (0, common_1.Get)("/:roleCode"),
    __param(0, (0, common_1.Param)("roleCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getDetails", null);
__decorate([
    (0, common_1.Post)("/page"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_params_dto_1.PaginationParamsDto]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "getPaginated", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [roles_create_dto_1.CreateRoleDto, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "create", null);
__decorate([
    (0, common_1.Put)("/:roleCode"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("roleCode")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, roles_update_dto_1.UpdateRoleDto, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("/:roleCode"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("roleCode")),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RoleController.prototype, "delete", null);
RoleController = __decorate([
    (0, swagger_1.ApiTags)("roles"),
    (0, common_1.Controller)("roles"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [roles_service_1.RoleService])
], RoleController);
exports.RoleController = RoleController;
//# sourceMappingURL=role.controller.js.map