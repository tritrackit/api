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
exports.ModelController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_response_constant_1 = require("../../common/constant/api-response.constant");
const model_create_dto_1 = require("../../core/dto/model/model.create.dto");
const model_update_dto_1 = require("../../core/dto/model/model.update.dto");
const model_service_1 = require("../../services/model.service");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const get_user_decorator_1 = require("../../core/auth/get-user.decorator");
let ModelController = class ModelController {
    constructor(modelService) {
        this.modelService = modelService;
    }
    async getDetails(modelId) {
        const res = {};
        try {
            res.data = await this.modelService.getById(modelId);
            res.success = true;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async getPaginated(params = { pageSize: "10", pageIndex: "0", order: { name: "ASC" }, keywords: "" }) {
        const res = {};
        try {
            res.data = await this.modelService.getPagination(params);
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
            res.data = await this.modelService.create(accessDto, userId);
            res.success = true;
            res.message = `Model ${api_response_constant_1.SAVING_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async updateOrder(dto, userId) {
        const res = {};
        try {
            res.data = await this.modelService.updateOrder(dto, userId);
            res.success = true;
            res.message = `Model ${api_response_constant_1.UPDATE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async update(modelId, dto, userId) {
        const res = {};
        try {
            res.data = await this.modelService.update(modelId, dto, userId);
            res.success = true;
            res.message = `Model ${api_response_constant_1.UPDATE_SUCCESS}`;
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : e;
            return res;
        }
    }
    async delete(modelId, userId) {
        const res = {};
        try {
            res.data = await this.modelService.delete(modelId, userId);
            res.success = true;
            res.message = `Model ${api_response_constant_1.DELETE_SUCCESS}`;
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
    (0, common_1.Get)("/:modelId"),
    __param(0, (0, common_1.Param)("modelId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "getDetails", null);
__decorate([
    (0, common_1.Post)("/page"),
    (0, swagger_1.ApiBody)({
        schema: {
            type: "object",
            properties: {
                pageSize: { type: "number", example: 10 },
                pageIndex: { type: "number", example: 0 },
                order: { type: "object", default: { sequenceId: "ASC" } },
                keywords: { type: "string", example: "", default: "" },
            },
            required: ["pageSize", "pageIndex", "order", "keywords"],
        },
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "getPaginated", null);
__decorate([
    (0, common_1.Post)(""),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [model_create_dto_1.CreateModelDto, String]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "create", null);
__decorate([
    (0, common_1.Put)("/updateOrder"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, String]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Put)("/:modelId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("modelId")),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, model_update_dto_1.UpdateModelDto, String]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)("/:modelId"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)("modelId")),
    __param(1, (0, get_user_decorator_1.GetUser)("sub")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ModelController.prototype, "delete", null);
ModelController = __decorate([
    (0, swagger_1.ApiTags)("model"),
    (0, common_1.Controller)("model"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [model_service_1.ModelService])
], ModelController);
exports.ModelController = ModelController;
//# sourceMappingURL=model.controller.js.map