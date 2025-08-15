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
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const employee_user_error_constant_1 = require("../common/constant/employee-user-error.constant");
const role_constant_1 = require("../common/constant/role.constant");
const utils_1 = require("../common/utils/utils");
const EmployeeUsers_1 = require("../db/entities/EmployeeUsers");
const Roles_1 = require("../db/entities/Roles");
const typeorm_2 = require("typeorm");
const cache_service_1 = require("./cache.service");
const cache_constant_1 = require("../common/constant/cache.constant");
let RoleService = class RoleService {
    constructor(roleRepo, cacheService) {
        this.roleRepo = roleRepo;
        this.cacheService = cacheService;
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        const key = cache_constant_1.CacheKeys.roles.list(pageIndex, pageSize, JSON.stringify(order), JSON.stringify(columnDef));
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
        const take = Number(pageSize);
        const condition = (0, utils_1.columnDefToTypeORMCondition)(columnDef);
        const [results, total] = await Promise.all([
            this.roleRepo.find({
                where: Object.assign(Object.assign({}, condition), { active: true }),
                relations: {
                    createdBy: true,
                    updatedBy: true,
                },
                skip,
                take,
                order,
            }),
            this.roleRepo.count({
                where: Object.assign(Object.assign({}, condition), { active: true }),
            }),
        ]);
        const response = {
            results: results.map((x) => {
                var _a, _b, _c, _d;
                (_a = x === null || x === void 0 ? void 0 : x.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = x === null || x === void 0 ? void 0 : x.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = x === null || x === void 0 ? void 0 : x.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = x === null || x === void 0 ? void 0 : x.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                return x;
            }),
            total,
        };
        this.cacheService.set(key, response);
        return response;
    }
    async getByCode(roleCode) {
        var _a, _b, _c, _d;
        const key = cache_constant_1.CacheKeys.roles.byCode(roleCode);
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const result = await this.roleRepo.findOne({
            select: {
                roleId: true,
                roleCode: true,
                name: true,
                accessPages: true,
            },
            where: {
                roleCode,
                active: true,
            },
            relations: {
                createdBy: true,
                updatedBy: true,
            },
        });
        if (!result) {
            throw Error(role_constant_1.ROLE_ERROR_NOT_FOUND);
        }
        (_a = result === null || result === void 0 ? void 0 : result.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = result === null || result === void 0 ? void 0 : result.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        this.cacheService.set(key, result);
        return result;
    }
    async create(dto, createdByUserId) {
        return await this.roleRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            try {
                let role = new Roles_1.Roles();
                role.name = dto.name;
                role.accessPages = dto.accessPages;
                role.dateCreated = await (0, utils_1.getDate)();
                const createdByKey = cache_constant_1.CacheKeys.employeeUsers.byId(createdByUserId);
                let createdBy = this.cacheService.get(createdByKey);
                if (!createdBy) {
                    createdBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                        where: {
                            employeeUserId: createdByUserId,
                            active: true,
                        },
                        relations: {
                            role: true,
                            createdBy: true,
                            updatedBy: true,
                            pictureFile: true,
                        },
                    });
                    this.cacheService.set(createdByKey, createdBy);
                }
                role.createdBy = Object.assign({}, createdBy);
                delete role.createdBy.createdBy;
                delete role.createdBy.updatedBy;
                role = await entityManager.save(role);
                role.roleCode = (0, utils_1.generateIndentityCode)(role.roleId);
                role = await entityManager.save(Roles_1.Roles, role);
                (_a = role === null || role === void 0 ? void 0 : role.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = role === null || role === void 0 ? void 0 : role.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = role === null || role === void 0 ? void 0 : role.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = role === null || role === void 0 ? void 0 : role.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.roles.prefix);
                return role;
            }
            catch (ex) {
                if (ex.message.includes("duplicate")) {
                    throw new common_1.HttpException(role_constant_1.ROLE_ERROR_DUPLICATE, common_1.HttpStatus.BAD_REQUEST);
                }
                else {
                    throw ex;
                }
            }
        });
    }
    async update(roleCode, dto, updatedByUserId) {
        return await this.roleRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            try {
                const key = cache_constant_1.CacheKeys.roles.byCode(roleCode);
                let role = this.cacheService.get(key);
                if (!role) {
                    role = await entityManager.findOne(Roles_1.Roles, {
                        where: {
                            roleCode,
                            active: true,
                        },
                        relations: {
                            createdBy: true,
                            updatedBy: true,
                        },
                    });
                }
                if (!role) {
                    throw Error(role_constant_1.ROLE_ERROR_NOT_FOUND);
                }
                role.name = dto.name;
                role.accessPages = dto.accessPages;
                role.lastUpdatedAt = await (0, utils_1.getDate)();
                const updatedByKey = cache_constant_1.CacheKeys.employeeUsers.byId(updatedByUserId);
                let updatedBy = this.cacheService.get(updatedByKey);
                if (!updatedBy) {
                    updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                        where: {
                            employeeUserId: updatedByUserId,
                            active: true,
                        },
                        relations: {
                            role: true,
                            createdBy: true,
                            updatedBy: true,
                            pictureFile: true,
                        },
                    });
                    this.cacheService.set(updatedByKey, updatedBy);
                }
                if (!updatedBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                if (!updatedBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                role.updatedBy = Object.assign({}, updatedBy);
                delete role.updatedBy.createdBy;
                delete role.updatedBy.updatedBy;
                role = await entityManager.save(Roles_1.Roles, role);
                (_a = role === null || role === void 0 ? void 0 : role.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = role === null || role === void 0 ? void 0 : role.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = role === null || role === void 0 ? void 0 : role.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = role === null || role === void 0 ? void 0 : role.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                this.cacheService.del(cache_constant_1.CacheKeys.roles.byId(role === null || role === void 0 ? void 0 : role.roleId));
                this.cacheService.del(cache_constant_1.CacheKeys.roles.byCode(role.roleCode));
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.roles.prefix);
                return role;
            }
            catch (ex) {
                if (ex.message.includes("duplicate")) {
                    throw new common_1.HttpException(role_constant_1.ROLE_ERROR_DUPLICATE, common_1.HttpStatus.BAD_REQUEST);
                }
                else {
                    throw ex;
                }
            }
        });
    }
    async delete(roleCode, updatedByUserId) {
        return await this.roleRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            const key = cache_constant_1.CacheKeys.roles.byCode(roleCode);
            let role = this.cacheService.get(key);
            if (!role) {
                role = await entityManager.findOne(Roles_1.Roles, {
                    where: {
                        roleCode,
                        active: true,
                    },
                    relations: {
                        createdBy: true,
                        updatedBy: true,
                    },
                });
            }
            if (!role) {
                throw Error(role_constant_1.ROLE_ERROR_NOT_FOUND);
            }
            role.active = false;
            role.lastUpdatedAt = await (0, utils_1.getDate)();
            const updatedByKey = cache_constant_1.CacheKeys.employeeUsers.byId(updatedByUserId);
            let updatedBy = this.cacheService.get(updatedByKey);
            if (!updatedBy) {
                updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: updatedByUserId,
                        active: true,
                    },
                    relations: {
                        role: true,
                        createdBy: true,
                        updatedBy: true,
                        pictureFile: true,
                    },
                });
                this.cacheService.set(updatedByKey, updatedBy);
            }
            if (!updatedBy) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            role.updatedBy = updatedBy;
            role = await entityManager.save(Roles_1.Roles, role);
            (_a = role === null || role === void 0 ? void 0 : role.createdBy) === null || _a === void 0 ? true : delete _a.password;
            (_b = role === null || role === void 0 ? void 0 : role.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
            (_c = role === null || role === void 0 ? void 0 : role.updatedBy) === null || _c === void 0 ? true : delete _c.password;
            (_d = role === null || role === void 0 ? void 0 : role.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            this.cacheService.del(cache_constant_1.CacheKeys.roles.byId(role === null || role === void 0 ? void 0 : role.roleId));
            this.cacheService.del(cache_constant_1.CacheKeys.roles.byCode(role.roleCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.roles.prefix);
            return role;
        });
    }
};
RoleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Roles_1.Roles)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cache_service_1.CacheService])
], RoleService);
exports.RoleService = RoleService;
//# sourceMappingURL=roles.service.js.map