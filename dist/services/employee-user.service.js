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
var EmployeeUserService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeUserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const role_constant_1 = require("../common/constant/role.constant");
const utils_1 = require("../common/utils/utils");
const EmployeeUsers_1 = require("../db/entities/EmployeeUsers");
const typeorm_2 = require("typeorm");
const employee_user_error_constant_1 = require("../common/constant/employee-user-error.constant");
const Roles_1 = require("../db/entities/Roles");
const email_service_1 = require("./email.service");
const cloudinary_service_1 = require("./cloudinary.service");
const File_1 = require("../db/entities/File");
const cache_service_1 = require("./cache.service");
const cache_constant_1 = require("../common/constant/cache.constant");
let EmployeeUserService = EmployeeUserService_1 = class EmployeeUserService {
    constructor(employeeUserRepo, emailService, cloudinaryService, cacheService) {
        this.employeeUserRepo = employeeUserRepo;
        this.emailService = emailService;
        this.cloudinaryService = cloudinaryService;
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(EmployeeUserService_1.name);
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const key = cache_constant_1.CacheKeys.employeeUsers.list(pageIndex, pageSize, JSON.stringify(order), JSON.stringify(columnDef));
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
        const take = Number(pageSize);
        const nameFilter = columnDef.find((x) => x.apiNotation === "name");
        const condition = (0, utils_1.columnDefToTypeORMCondition)(columnDef);
        if (nameFilter) {
            delete condition["name"];
        }
        let whereCondition;
        if (nameFilter) {
            whereCondition = [
                Object.assign(Object.assign({}, condition), { active: true, firstName: (0, typeorm_2.ILike)(`%${(_a = nameFilter === null || nameFilter === void 0 ? void 0 : nameFilter.filter) !== null && _a !== void 0 ? _a : ""}%`) }),
                Object.assign(Object.assign({}, condition), { active: true, lastName: (0, typeorm_2.ILike)(`%${(_b = nameFilter === null || nameFilter === void 0 ? void 0 : nameFilter.filter) !== null && _b !== void 0 ? _b : ""}%`) }),
                Object.assign(Object.assign({}, condition), { active: true, firstName: ((_c = nameFilter === null || nameFilter === void 0 ? void 0 : nameFilter.filter) === null || _c === void 0 ? void 0 : _c.length) > 0
                        ? (0, typeorm_2.ILike)(`%${(_d = nameFilter === null || nameFilter === void 0 ? void 0 : nameFilter.filter.split(" ")[0]) !== null && _d !== void 0 ? _d : ""}%`)
                        : (0, typeorm_2.ILike)(`%${(_e = nameFilter === null || nameFilter === void 0 ? void 0 : nameFilter.filter) !== null && _e !== void 0 ? _e : ""}%`) }),
                Object.assign(Object.assign({}, condition), { active: true, lastName: ((_f = nameFilter === null || nameFilter === void 0 ? void 0 : nameFilter.filter) === null || _f === void 0 ? void 0 : _f.length) > 0
                        ? (0, typeorm_2.ILike)(`%${(_g = nameFilter === null || nameFilter === void 0 ? void 0 : nameFilter.filter.split(" ")[0]) !== null && _g !== void 0 ? _g : ""}%`)
                        : (0, typeorm_2.ILike)(`%${(_h = nameFilter === null || nameFilter === void 0 ? void 0 : nameFilter.filter) !== null && _h !== void 0 ? _h : ""}%`) }),
            ];
        }
        else {
            whereCondition = Object.assign(Object.assign({}, condition), { active: true });
        }
        const [results, total] = await Promise.all([
            this.employeeUserRepo.find({
                where: whereCondition,
                relations: {
                    role: true,
                },
                skip,
                take,
                order,
            }),
            this.employeeUserRepo.count({
                where: whereCondition,
            }),
        ]);
        const response = {
            results: results.map((x) => {
                var _a, _b, _c, _d;
                x === null || x === void 0 ? true : delete x.password;
                x === null || x === void 0 ? true : delete x.refreshToken;
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
    async getByCode(employeeUserCode) {
        var _a, _b, _c, _d;
        const key = cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUserCode);
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const res = await this.employeeUserRepo.findOne({
            where: {
                employeeUserCode,
                active: true,
            },
            relations: {
                role: true,
                createdBy: true,
                updatedBy: true,
                pictureFile: true,
            },
        });
        if (!res) {
            throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        this.cacheService.set(key, res);
        const response = Object.assign({}, res);
        response === null || response === void 0 ? true : delete response.password;
        response === null || response === void 0 ? true : delete response.refreshToken;
        (_a = response === null || response === void 0 ? void 0 : response.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = response === null || response === void 0 ? void 0 : response.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = response === null || response === void 0 ? void 0 : response.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = response === null || response === void 0 ? void 0 : response.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        return response;
    }
    async getById(employeeUserId) {
        var _a, _b, _c, _d;
        const key = cache_constant_1.CacheKeys.employeeUsers.byId(employeeUserId);
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const res = await this.employeeUserRepo.findOne({
            where: {
                employeeUserId,
                active: true,
            },
            relations: {
                role: true,
                createdBy: true,
                updatedBy: true,
                pictureFile: true,
            },
        });
        if (!res) {
            throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        this.cacheService.set(key, res);
        const response = Object.assign({}, res);
        response === null || response === void 0 ? true : delete response.password;
        response === null || response === void 0 ? true : delete response.refreshToken;
        (_a = response === null || response === void 0 ? void 0 : response.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = response === null || response === void 0 ? void 0 : response.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = response === null || response === void 0 ? void 0 : response.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = response === null || response === void 0 ? void 0 : response.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        return response;
    }
    async create(dto, createdByUserId) {
        return await this.employeeUserRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e, _f;
            try {
                let employeeUser = new EmployeeUsers_1.EmployeeUsers();
                employeeUser.userName = dto.email;
                employeeUser.email = dto.email;
                employeeUser.contactNo = dto.contactNo;
                employeeUser.password = await (0, utils_1.hash)(dto.password);
                employeeUser.firstName = (_a = dto.firstName) !== null && _a !== void 0 ? _a : "";
                employeeUser.lastName = (_b = dto.lastName) !== null && _b !== void 0 ? _b : "";
                employeeUser.invitationCode = (0, utils_1.generateOTP)();
                if (dto.roleCode) {
                    const roleKey = cache_constant_1.CacheKeys.roles.byCode(dto.roleCode);
                    let role = this.cacheService.get(roleKey);
                    if (!role) {
                        role = await entityManager.findOne(Roles_1.Roles, {
                            where: {
                                roleCode: dto.roleCode,
                                active: true,
                            },
                            relations: {
                                createdBy: true,
                                updatedBy: true,
                            },
                        });
                        this.cacheService.set(roleKey, role);
                    }
                    if (!role) {
                        throw Error(role_constant_1.ROLE_ERROR_NOT_FOUND);
                    }
                    employeeUser.role = role;
                }
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
                if (!createdBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                employeeUser.createdBy = createdBy;
                employeeUser.createdBy = Object.assign({}, createdBy);
                employeeUser.createdBy.createdBy;
                employeeUser.createdBy.updatedBy;
                employeeUser.dateCreated = await (0, utils_1.getDate)();
                employeeUser = await entityManager.save(EmployeeUsers_1.EmployeeUsers, employeeUser);
                employeeUser.employeeUserCode = (0, utils_1.generateIndentityCode)(employeeUser.employeeUserId);
                employeeUser = await entityManager.save(EmployeeUsers_1.EmployeeUsers, employeeUser);
                employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserCode: employeeUser.employeeUserCode,
                        active: true,
                    },
                    relations: {},
                });
                delete employeeUser.password;
                delete employeeUser.refreshToken;
                const sendEmailResult = await this.emailService.sendEmailVerification(employeeUser.email, employeeUser.invitationCode);
                if (!sendEmailResult) {
                    throw new Error("Error sending email verification!");
                }
                employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.password;
                employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.refreshToken;
                (_c = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                (_e = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _e === void 0 ? true : delete _e.password;
                (_f = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _f === void 0 ? true : delete _f.refreshToken;
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.employeeUsers.prefix);
                return employeeUser;
            }
            catch (ex) {
                if (ex.message.includes("duplicate") &&
                    ex.message.toLowerCase().includes("username")) {
                    throw new common_1.HttpException(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_DUPLICATE, common_1.HttpStatus.BAD_REQUEST);
                }
                else if (ex.message.includes("duplicate") &&
                    ex.message.toLowerCase().includes("email")) {
                    throw new common_1.HttpException(employee_user_error_constant_1.EMPLOYEE_EMAIL_ERROR_USER_DUPLICATE, common_1.HttpStatus.BAD_REQUEST);
                }
                else {
                    throw ex;
                }
            }
        });
    }
    async resendInvitation(employeeUserCode) {
        return await this.employeeUserRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUserCode);
            let employeeUser = this.cacheService.get(employeeUserKey);
            if (!employeeUser) {
                employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserCode,
                        active: true,
                    },
                    relations: {
                        role: true,
                        createdBy: true,
                        updatedBy: true,
                        pictureFile: true,
                    },
                });
            }
            if (!employeeUser) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            if (employeeUser.accessGranted) {
                throw new common_1.HttpException("Employee user already has access granted!", common_1.HttpStatus.BAD_REQUEST);
            }
            employeeUser.invitationCode = (0, utils_1.generateOTP)();
            employeeUser = await entityManager.save(EmployeeUsers_1.EmployeeUsers, employeeUser);
            const sendEmailResult = await this.emailService.sendEmailVerification(employeeUser.email, employeeUser.invitationCode);
            if (!sendEmailResult) {
                throw new Error("Error sending email verification!");
            }
            employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.password;
            employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.refreshToken;
            (_a = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _a === void 0 ? true : delete _a.password;
            (_b = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
            (_c = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _c === void 0 ? true : delete _c.password;
            (_d = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byId(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserId));
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.employeeUsers.prefix);
            return employeeUser;
        });
    }
    async updateProfile(employeeUserId, dto) {
        return await this.employeeUserRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byId(employeeUserId);
            let employeeUser = this.cacheService.get(employeeUserKey);
            if (!employeeUser) {
                employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId,
                        active: true,
                    },
                    relations: {
                        role: true,
                        createdBy: true,
                        updatedBy: true,
                        pictureFile: true,
                    },
                });
            }
            if (!employeeUser) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            employeeUser.userName = dto.email;
            employeeUser.email = dto.email;
            employeeUser.contactNo = dto.contactNo;
            employeeUser.firstName = (_a = dto.firstName) !== null && _a !== void 0 ? _a : "";
            employeeUser.lastName = (_b = dto.lastName) !== null && _b !== void 0 ? _b : "";
            employeeUser.updatedBy = employeeUser;
            employeeUser.lastUpdatedAt = await (0, utils_1.getDate)();
            let uploaded;
            if (dto.pictureFile) {
                if (employeeUser.pictureFile) {
                    try {
                        await this.cloudinaryService.deleteByPublicId((_c = employeeUser.pictureFile) === null || _c === void 0 ? void 0 : _c.publicId);
                    }
                    catch (ex) {
                        this.logger.warn(`Failed to delete old picture file: ${ex.message}`, ex.stack);
                    }
                }
                uploaded = await this.cloudinaryService.uploadDataUri(dto.pictureFile.data, dto.pictureFile.fileName, "model");
            }
            if (uploaded) {
                uploaded.fileId = (_d = employeeUser.pictureFile) === null || _d === void 0 ? void 0 : _d.fileId;
                employeeUser.pictureFile = await entityManager.save(File_1.File, uploaded);
            }
            employeeUser = await entityManager.save(EmployeeUsers_1.EmployeeUsers, employeeUser);
            employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserId,
                    active: true,
                },
                relations: {},
            });
            employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.password;
            employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.refreshToken;
            (_e = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _e === void 0 ? true : delete _e.password;
            (_f = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _f === void 0 ? true : delete _f.refreshToken;
            (_g = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _g === void 0 ? true : delete _g.password;
            (_h = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _h === void 0 ? true : delete _h.refreshToken;
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byId(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserId));
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.employeeUsers.prefix);
            return employeeUser;
        });
    }
    async update(employeeUserCode, dto, updatedByUserId) {
        return await this.employeeUserRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            try {
                const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUserCode);
                let employeeUser = this.cacheService.get(employeeUserKey);
                if (!employeeUser) {
                    employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                        where: {
                            employeeUserCode,
                            active: true,
                        },
                        relations: {
                            role: true,
                            createdBy: true,
                            updatedBy: true,
                            pictureFile: true,
                        },
                    });
                }
                if (!employeeUser) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                employeeUser.userName = dto.email;
                employeeUser.email = dto.email;
                employeeUser.contactNo = dto.contactNo;
                employeeUser.firstName = dto.firstName;
                employeeUser.lastName = dto.lastName;
                if (dto.roleCode) {
                    const roleKey = cache_constant_1.CacheKeys.roles.byCode(dto.roleCode);
                    let role = this.cacheService.get(roleKey);
                    if (!role) {
                        role = await entityManager.findOne(Roles_1.Roles, {
                            where: {
                                roleCode: dto.roleCode,
                                active: true,
                            },
                            relations: {
                                createdBy: true,
                                updatedBy: true,
                            },
                        });
                        this.cacheService.set(roleKey, role);
                    }
                    if (!role) {
                        throw Error(role_constant_1.ROLE_ERROR_NOT_FOUND);
                    }
                    employeeUser.role = role;
                }
                employeeUser.accessGranted = true;
                employeeUser.lastUpdatedAt = await (0, utils_1.getDate)();
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
                employeeUser.updatedBy = updatedBy;
                employeeUser = await entityManager.save(EmployeeUsers_1.EmployeeUsers, employeeUser);
                employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserCode,
                        active: true,
                    },
                    relations: {},
                });
                employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.password;
                employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.refreshToken;
                (_a = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byId(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserId));
                this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserCode));
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.employeeUsers.prefix);
                return employeeUser;
            }
            catch (ex) {
                if (ex.message.includes("duplicate")) {
                    throw new common_1.HttpException(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_DUPLICATE, common_1.HttpStatus.BAD_REQUEST);
                }
                else {
                    throw ex;
                }
            }
        });
    }
    async delete(employeeUserCode, updatedByUserId) {
        return await this.employeeUserRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUserCode);
            let employeeUser = this.cacheService.get(employeeUserKey);
            if (!employeeUser) {
                employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserCode,
                        active: true,
                    },
                    relations: {
                        role: true,
                        createdBy: true,
                        updatedBy: true,
                        pictureFile: true,
                    },
                });
            }
            if (!employeeUser) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            employeeUser.active = false;
            employeeUser.lastUpdatedAt = await (0, utils_1.getDate)();
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
            employeeUser.updatedBy = updatedBy;
            employeeUser = await entityManager.save(EmployeeUsers_1.EmployeeUsers, employeeUser);
            employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.password;
            employeeUser === null || employeeUser === void 0 ? true : delete employeeUser.refreshToken;
            (_a = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _a === void 0 ? true : delete _a.password;
            (_b = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
            (_c = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _c === void 0 ? true : delete _c.password;
            (_d = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byId(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserId));
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.employeeUsers.prefix);
            return employeeUser;
        });
    }
    async updatePassword(employeeUserCode, password, updatedByUserId) {
        return await this.employeeUserRepo.manager.transaction(async (entityManager) => {
            const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUserCode);
            let employeeUser = this.cacheService.get(employeeUserKey);
            if (!employeeUser) {
                employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserCode,
                        active: true,
                    },
                    relations: {
                        role: true,
                        createdBy: true,
                        updatedBy: true,
                        pictureFile: true,
                    },
                });
            }
            if (!employeeUser) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            employeeUser.lastUpdatedAt = await (0, utils_1.getDate)();
            employeeUser.password = await (0, utils_1.hash)(password);
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
            employeeUser.updatedBy = updatedBy;
            employeeUser = await entityManager.save(EmployeeUsers_1.EmployeeUsers, employeeUser);
            delete employeeUser.createdBy;
            delete employeeUser.updatedBy;
            delete employeeUser.password;
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byId(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserId));
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.employeeUsers.prefix);
            return employeeUser;
        });
    }
};
EmployeeUserService = EmployeeUserService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(EmployeeUsers_1.EmployeeUsers)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        email_service_1.EmailService,
        cloudinary_service_1.CloudinaryService,
        cache_service_1.CacheService])
], EmployeeUserService);
exports.EmployeeUserService = EmployeeUserService;
//# sourceMappingURL=employee-user.service.js.map