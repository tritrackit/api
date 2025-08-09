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
exports.EmployeeUserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_constant_1 = require("../../common/constant/api-response.constant");
const pagination_params_dto_1 = require("../../core/dto/pagination-params.dto");
const employee_user_create_dto_1 = require("../../core/dto/employee-user/employee-user.create.dto");
const employee_user_update_dto_1 = require("../../core/dto/employee-user/employee-user.update.dto");
const employee_user_service_1 = require("../../services/employee-user.service");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const get_user_decorator_1 = require("../../core/auth/get-user.decorator");
let EmployeeUserController = class EmployeeUserController {
    constructor(employeeUserService) {
        this.employeeUserService = employeeUserService;
    }
    async getByCode(employeeUserCode) {
        const res = {};
        try {
            res.data = await this.employeeUserService.getByCode(employeeUserCode);
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async getPagination(paginationParams) {
        const res = {};
        try {
            res.data = await this.employeeUserService.getPagination(paginationParams);
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async create(dto, userId) {
        const res = {};
        try {
            res.data = await this.employeeUserService.create(dto, userId);
            res.success = true;
            res.message = `Employee User  ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async resendInvitation(dto = { employeeUserCode: "" }) {
        const res = {};
        try {
            res.data = await this.employeeUserService.resendInvitation(dto.employeeUserCode);
            res.success = true;
            res.message = `Employee User Invitation Resent ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async updateProfile(userId, dto) {
        const res = {};
        try {
            res.data = await this.employeeUserService.updateProfile(userId, dto);
            res.success = true;
            res.message = `Employee User ${api_response_constant_1.UPDATE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async update(employeeUserCode, dto, userId) {
        const res = {};
        try {
            res.data = await this.employeeUserService.update(employeeUserCode, dto, userId);
            res.success = true;
            res.message = `Employee User ${api_response_constant_1.UPDATE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async delete(employeeUserCode, userId) {
        const res = {};
        try {
            res.data = await this.employeeUserService.delete(employeeUserCode, userId);
            res.success = true;
            res.message = `Employee User ${api_response_constant_1.DELETE_SUCCESS}`;
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
    (0, common_1.Get)("/:employeeUserCode"),
    __param(0, (0, common_1.Param)("employeeUserCode")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmployeeUserController.prototype, "getByCode", null);
__decorate([
    (0, common_1.Post)("/page"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_params_dto_1.PaginationParamsDto]),
    __metadata("design:returntype", Promise)
], EmployeeUserController.prototype, "getPagination", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [employee_user_create_dto_1.CreateEmployeeUserDto, String]),
    __metadata("design:returntype", Promise)
], EmployeeUserController.prototype, "create", null);
__decorate([
    (0, common_1.Post)("resend-invitation"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                employeeUserCode: { type: "string" },
            },
            required: ["employeeUserCode"],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EmployeeUserController.prototype, "resendInvitation", null);
__decorate([
    (0, common_1.Put)("/updateProfile/"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, get_user_decorator_1.GetUser)("sub")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_user_update_dto_1.UpdateEmployeeUserProfileDto]),
    __metadata("design:returntype", Promise)
], EmployeeUserController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Put)("/:employeeUserCode"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("employeeUserCode")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, employee_user_update_dto_1.UpdateEmployeeUserDto, String]),
    __metadata("design:returntype", Promise)
], EmployeeUserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("/:employeeUserCode"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("employeeUserCode")),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], EmployeeUserController.prototype, "delete", null);
EmployeeUserController = __decorate([
    (0, swagger_1.ApiTags)("employee-users"),
    (0, common_1.Controller)("employee-users"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [employee_user_service_1.EmployeeUserService])
], EmployeeUserController);
exports.EmployeeUserController = EmployeeUserController;
//# sourceMappingURL=employee-user.controller.js.map