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
let EmployeeUserService = class EmployeeUserService {
    constructor(employeeUserRepo, emailService) {
        this.employeeUserRepo = employeeUserRepo;
        this.emailService = emailService;
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        var _a, _b;
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
        return {
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
    }
    async getByCode(employeeUserCode) {
        var _a, _b, _c, _d;
        const res = await this.employeeUserRepo.findOne({
            where: {
                employeeUserCode,
                active: true,
            },
            relations: {
                role: true,
            },
        });
        if (!res) {
            throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        res === null || res === void 0 ? true : delete res.password;
        res === null || res === void 0 ? true : delete res.refreshToken;
        (_a = res === null || res === void 0 ? void 0 : res.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = res === null || res === void 0 ? void 0 : res.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = res === null || res === void 0 ? void 0 : res.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = res === null || res === void 0 ? void 0 : res.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        return res;
    }
    async getById(employeeUserId) {
        var _a, _b, _c, _d;
        const res = await this.employeeUserRepo.findOne({
            where: {
                employeeUserId,
                active: true,
            },
            relations: {
                role: true,
            },
        });
        if (!res) {
            throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        res === null || res === void 0 ? true : delete res.password;
        res === null || res === void 0 ? true : delete res.refreshToken;
        (_a = res === null || res === void 0 ? void 0 : res.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = res === null || res === void 0 ? void 0 : res.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = res === null || res === void 0 ? void 0 : res.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = res === null || res === void 0 ? void 0 : res.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        return res;
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
                    const access = await entityManager.findOne(Roles_1.Roles, {
                        where: {
                            roleCode: dto.roleCode,
                            active: true,
                        },
                    });
                    if (!access) {
                        throw Error(role_constant_1.ROLE_ERROR_NOT_FOUND);
                    }
                    employeeUser.role = access;
                }
                const createdBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: createdByUserId,
                        active: true,
                    },
                });
                if (!createdBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                employeeUser.createdBy = createdBy;
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
            let employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserCode,
                    active: true,
                },
                relations: {},
            });
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
            return employeeUser;
        });
    }
    async updateProfile(employeeUserId, dto) {
        return await this.employeeUserRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e, _f;
            let employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserId,
                    active: true,
                },
                relations: {},
            });
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
            (_c = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _c === void 0 ? true : delete _c.password;
            (_d = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.createdBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            (_e = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _e === void 0 ? true : delete _e.password;
            (_f = employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.updatedBy) === null || _f === void 0 ? true : delete _f.refreshToken;
            return employeeUser;
        });
    }
    async update(employeeUserCode, dto, updatedByUserId) {
        return await this.employeeUserRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            try {
                let employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserCode,
                        active: true,
                    },
                    relations: {},
                });
                if (!employeeUser) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                employeeUser.userName = dto.email;
                employeeUser.email = dto.email;
                employeeUser.contactNo = dto.contactNo;
                employeeUser.firstName = dto.firstName;
                employeeUser.lastName = dto.lastName;
                if (dto.roleCode) {
                    const role = await entityManager.findOne(Roles_1.Roles, {
                        where: {
                            roleCode: dto.roleCode,
                            active: true,
                        },
                    });
                    if (!role) {
                        throw Error(role_constant_1.ROLE_ERROR_NOT_FOUND);
                    }
                    employeeUser.role = role;
                }
                employeeUser.accessGranted = true;
                employeeUser.lastUpdatedAt = await (0, utils_1.getDate)();
                const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: updatedByUserId,
                        active: true,
                    },
                });
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
            let employeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserCode,
                    active: true,
                },
                relations: {},
            });
            if (!employeeUser) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            employeeUser.active = false;
            employeeUser.lastUpdatedAt = await (0, utils_1.getDate)();
            const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserId: updatedByUserId,
                    active: true,
                },
            });
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
            return employeeUser;
        });
    }
};
EmployeeUserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(EmployeeUsers_1.EmployeeUsers)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        email_service_1.EmailService])
], EmployeeUserService);
exports.EmployeeUserService = EmployeeUserService;
//# sourceMappingURL=employee-user.service.js.map