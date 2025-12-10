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
exports.MetadataController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Locations_1 = require("../../db/entities/Locations");
const Status_1 = require("../../db/entities/Status");
const Model_1 = require("../../db/entities/Model");
let MetadataController = class MetadataController {
    constructor(locationsRepo, statusRepo, modelRepo) {
        this.locationsRepo = locationsRepo;
        this.statusRepo = statusRepo;
        this.modelRepo = modelRepo;
    }
    async getLocations() {
        const res = {};
        try {
            res.data = await this.locationsRepo.find({
                where: { active: true },
                select: ['locationId', 'name', 'locationCode'],
                order: { name: 'ASC' }
            });
            res.success = true;
            res.message = "Locations retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getStatuses() {
        const res = {};
        try {
            res.data = await this.statusRepo.find({
                select: ['statusId', 'name'],
                order: { name: 'ASC' }
            });
            res.success = true;
            res.message = "Statuses retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getModels() {
        const res = {};
        try {
            res.data = await this.modelRepo.find({
                where: { active: true },
                select: ['modelId', 'modelName'],
                order: { modelName: 'ASC' }
            });
            res.success = true;
            res.message = "Models retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getColors() {
        const res = {};
        try {
            const colors = await this.modelRepo.manager
                .createQueryBuilder()
                .select('DISTINCT unit.color', 'color')
                .from('Units', 'unit')
                .where('unit.active = :active', { active: true })
                .andWhere('unit.color IS NOT NULL')
                .andWhere('unit.color != :empty', { empty: '' })
                .orderBy('unit.color', 'ASC')
                .getRawMany();
            res.data = colors.map(item => item.color).filter(color => color);
            res.success = true;
            res.message = "Colors retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getAllFilters() {
        const res = {};
        try {
            const [locations, statuses, models, colors] = await Promise.all([
                this.locationsRepo.find({
                    where: { active: true },
                    select: ['locationId', 'name', 'locationCode'],
                    order: { name: 'ASC' }
                }),
                this.statusRepo.find({
                    select: ['statusId', 'name'],
                    order: { name: 'ASC' }
                }),
                this.modelRepo.find({
                    where: { active: true },
                    select: ['modelId', 'modelName'],
                    order: { modelName: 'ASC' }
                }),
                this.modelRepo.manager
                    .createQueryBuilder()
                    .select('DISTINCT unit.color', 'color')
                    .from('Units', 'unit')
                    .where('unit.active = :active', { active: true })
                    .andWhere('unit.color IS NOT NULL')
                    .andWhere('unit.color != :empty', { empty: '' })
                    .orderBy('unit.color', 'ASC')
                    .getRawMany()
            ]);
            res.data = {
                locations,
                statuses,
                models,
                colors: colors.map(item => item.color),
                timeframeOptions: [
                    { value: 'DAILY', label: 'Today' },
                    { value: 'WEEKLY', label: 'This Week' },
                    { value: 'MONTHLY', label: 'This Month' },
                    { value: 'QUARTERLY', label: 'This Quarter' },
                    { value: 'YEARLY', label: 'This Year' },
                    { value: 'CUSTOM', label: 'Custom Range' }
                ]
            };
            res.success = true;
            res.message = "All filter options retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
};
__decorate([
    (0, common_1.Get)("locations"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "getLocations", null);
__decorate([
    (0, common_1.Get)("statuses"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "getStatuses", null);
__decorate([
    (0, common_1.Get)("models"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "getModels", null);
__decorate([
    (0, common_1.Get)("colors"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "getColors", null);
__decorate([
    (0, common_1.Get)("filters/all"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetadataController.prototype, "getAllFilters", null);
MetadataController = __decorate([
    (0, swagger_1.ApiTags)("metadata"),
    (0, common_1.Controller)("metadata"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __param(0, (0, typeorm_1.InjectRepository)(Locations_1.Locations)),
    __param(1, (0, typeorm_1.InjectRepository)(Status_1.Status)),
    __param(2, (0, typeorm_1.InjectRepository)(Model_1.Model)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], MetadataController);
exports.MetadataController = MetadataController;
//# sourceMappingURL=metadata.controller.js.map