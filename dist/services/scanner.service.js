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
exports.ScannerService = void 0;
const Locations_1 = require("../db/entities/Locations");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const scanner_constant_1 = require("../common/constant/scanner.constant");
const employee_user_error_constant_1 = require("../common/constant/employee-user-error.constant");
const utils_1 = require("../common/utils/utils");
const Scanner_1 = require("../db/entities/Scanner");
const EmployeeUsers_1 = require("../db/entities/EmployeeUsers");
const typeorm_2 = require("typeorm");
const locations_constant_1 = require("../common/constant/locations.constant");
const Status_1 = require("../db/entities/Status");
const cache_service_1 = require("./cache.service");
const cache_constant_1 = require("../common/constant/cache.constant");
let ScannerService = class ScannerService {
    constructor(scannerRepo, cacheService) {
        this.scannerRepo = scannerRepo;
        this.cacheService = cacheService;
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        const key = cache_constant_1.CacheKeys.scanner.list(pageIndex, pageSize, JSON.stringify(order), JSON.stringify(columnDef));
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
        const take = Number(pageSize);
        const condition = (0, utils_1.columnDefToTypeORMCondition)(columnDef);
        const [results, total] = await Promise.all([
            this.scannerRepo.find({
                where: Object.assign(Object.assign({}, condition), { active: true }),
                relations: {
                    createdBy: true,
                    updatedBy: true,
                    status: true,
                    location: true,
                    assignedEmployeeUser: true,
                },
                skip,
                take,
                order,
            }),
            this.scannerRepo.count({
                where: Object.assign(Object.assign({}, condition), { active: true }),
            }),
        ]);
        const response = {
            results: results.map((x) => {
                var _a, _b, _c, _d, _e, _f;
                (_a = x === null || x === void 0 ? void 0 : x.assignedEmployeeUser) === null || _a === void 0 ? true : delete _a.password;
                (_b = x === null || x === void 0 ? void 0 : x.assignedEmployeeUser) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = x === null || x === void 0 ? void 0 : x.createdBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = x === null || x === void 0 ? void 0 : x.createdBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                (_e = x === null || x === void 0 ? void 0 : x.updatedBy) === null || _e === void 0 ? true : delete _e.password;
                (_f = x === null || x === void 0 ? void 0 : x.updatedBy) === null || _f === void 0 ? true : delete _f.refreshToken;
                return x;
            }),
            total,
        };
        this.cacheService.set(key, response);
        return response;
    }
    async getById(scannerId) {
        var _a, _b, _c, _d, _e, _f;
        const key = cache_constant_1.CacheKeys.scanner.byId(scannerId);
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const result = await this.scannerRepo.findOne({
            where: {
                scannerId,
                active: true,
            },
            relations: {
                createdBy: true,
                updatedBy: true,
                assignedEmployeeUser: true,
                location: true,
                status: true,
            },
        });
        if (!result) {
            throw Error(scanner_constant_1.SCANNER_ERROR_NOT_FOUND);
        }
        (_a = result === null || result === void 0 ? void 0 : result.assignedEmployeeUser) === null || _a === void 0 ? true : delete _a.password;
        (_b = result === null || result === void 0 ? void 0 : result.assignedEmployeeUser) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = result === null || result === void 0 ? void 0 : result.createdBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = result === null || result === void 0 ? void 0 : result.createdBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        (_e = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _e === void 0 ? true : delete _e.password;
        (_f = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _f === void 0 ? true : delete _f.refreshToken;
        this.cacheService.set(key, result);
        return result;
    }
    async getByCode(scannerCode) {
        var _a, _b, _c, _d, _e, _f;
        const key = cache_constant_1.CacheKeys.scanner.byCode(scannerCode);
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const result = await this.scannerRepo.findOne({
            where: {
                scannerCode,
                active: true,
            },
            relations: {
                createdBy: true,
                updatedBy: true,
                assignedEmployeeUser: true,
                location: true,
                status: true,
            },
        });
        if (!result) {
            throw Error(scanner_constant_1.SCANNER_ERROR_NOT_FOUND);
        }
        (_a = result === null || result === void 0 ? void 0 : result.assignedEmployeeUser) === null || _a === void 0 ? true : delete _a.password;
        (_b = result === null || result === void 0 ? void 0 : result.assignedEmployeeUser) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = result === null || result === void 0 ? void 0 : result.createdBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = result === null || result === void 0 ? void 0 : result.createdBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        (_e = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _e === void 0 ? true : delete _e.password;
        (_f = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _f === void 0 ? true : delete _f.refreshToken;
        this.cacheService.set(key, result);
        return result;
    }
    async create(dto, createdByUserId) {
        try {
            return await this.scannerRepo.manager.transaction(async (entityManager) => {
                var _a, _b, _c, _d, _e, _f;
                let scanner = new Scanner_1.Scanner();
                scanner.scannerCode = dto.scannerCode;
                scanner.name = dto.name;
                scanner.dateCreated = await (0, utils_1.getDate)();
                const statusKey = cache_constant_1.CacheKeys.status.byId(dto.statusId);
                let status = this.cacheService.get(statusKey);
                if (!status) {
                    status = await entityManager.findOne(Status_1.Status, {
                        where: {
                            statusId: dto.statusId,
                        },
                    });
                    this.cacheService.set(statusKey, status);
                }
                if (!status) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                scanner.status = status;
                const locationKey = cache_constant_1.CacheKeys.locations.byId(dto.locationId);
                let location = this.cacheService.get(locationKey);
                if (!location) {
                    location = await entityManager.findOne(Locations_1.Locations, {
                        where: {
                            locationId: dto.locationId,
                            active: true,
                        },
                        relations: {
                            createdBy: true,
                            updatedBy: true,
                        },
                    });
                    this.cacheService.set(locationKey, location);
                }
                if (!location) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                scanner.location = location;
                const assignedEmployeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byId(dto.assignedEmployeeUserId);
                let assignedEmployeeUser = this.cacheService.get(assignedEmployeeUserKey);
                if (!assignedEmployeeUser) {
                    assignedEmployeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                        where: {
                            employeeUserId: dto.assignedEmployeeUserId,
                            active: true,
                        },
                        relations: {
                            role: true,
                            createdBy: true,
                            updatedBy: true,
                            pictureFile: true,
                        },
                    });
                    this.cacheService.set(assignedEmployeeUserKey, assignedEmployeeUser);
                }
                if (!assignedEmployeeUser) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                scanner.assignedEmployeeUser = Object.assign({}, assignedEmployeeUser);
                delete scanner.assignedEmployeeUser.createdBy;
                delete scanner.assignedEmployeeUser.updatedBy;
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
                scanner.createdBy = Object.assign({}, createdBy);
                delete scanner.createdBy.createdBy;
                delete scanner.createdBy.updatedBy;
                scanner = await entityManager.save(Scanner_1.Scanner, scanner);
                (_a = scanner === null || scanner === void 0 ? void 0 : scanner.assignedEmployeeUser) === null || _a === void 0 ? true : delete _a.password;
                (_b = scanner === null || scanner === void 0 ? void 0 : scanner.assignedEmployeeUser) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                (_e = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _e === void 0 ? true : delete _e.password;
                (_f = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _f === void 0 ? true : delete _f.refreshToken;
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.scanner.prefix);
                return scanner;
            });
        }
        catch (ex) {
            if (ex["message"] &&
                (ex["message"].toLowerCase().includes("duplicate key") ||
                    ex["message"].toLowerCase().includes("violates unique constraint")) &&
                ex["message"].includes("Name")) {
                throw Error("Name already exists!");
            }
            else if (ex["message"] &&
                (ex["message"].toLowerCase().includes("duplicate key") ||
                    ex["message"].toLowerCase().includes("violates unique constraint")) &&
                ex["message"].toLowerCase().includes("scannercode")) {
                throw Error("Scanner code already exists!");
            }
            else {
                throw ex;
            }
        }
    }
    async update(scannerId, dto, updatedByUserId) {
        try {
            return await this.scannerRepo.manager.transaction(async (entityManager) => {
                var _a, _b, _c, _d, _e, _f;
                const scannerKey = cache_constant_1.CacheKeys.scanner.byCode(scannerId);
                let scanner = this.cacheService.get(scannerKey);
                if (!scanner) {
                    scanner = await entityManager.findOne(Scanner_1.Scanner, {
                        where: {
                            scannerId,
                            active: true,
                        },
                        relations: {
                            createdBy: true,
                            updatedBy: true,
                            assignedEmployeeUser: true,
                            location: true,
                            status: true,
                        },
                    });
                }
                if (!scanner) {
                    throw Error(scanner_constant_1.SCANNER_ERROR_NOT_FOUND);
                }
                scanner.lastUpdatedAt = await (0, utils_1.getDate)();
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
                scanner.updatedBy = Object.assign({}, updatedBy);
                delete scanner.updatedBy.createdBy;
                delete scanner.updatedBy.updatedBy;
                scanner.scannerCode = dto.scannerCode;
                scanner.name = dto.name;
                const statusKey = cache_constant_1.CacheKeys.status.byId(dto.statusId);
                let status = this.cacheService.get(statusKey);
                if (!status) {
                    status = await entityManager.findOne(Status_1.Status, {
                        where: {
                            statusId: dto.statusId,
                        },
                    });
                    this.cacheService.set(statusKey, status);
                }
                if (!status) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                scanner.status = status;
                const locationKey = cache_constant_1.CacheKeys.locations.byId(dto.locationId);
                let location = this.cacheService.get(locationKey);
                if (!location) {
                    location = await entityManager.findOne(Locations_1.Locations, {
                        where: {
                            locationId: dto.locationId,
                            active: true,
                        },
                        relations: {
                            createdBy: true,
                            updatedBy: true,
                        },
                    });
                    this.cacheService.set(locationKey, location);
                }
                if (!location) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                scanner.location = location;
                const assignedEmployeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byId(dto.assignedEmployeeUserId);
                let assignedEmployeeUser = this.cacheService.get(assignedEmployeeUserKey);
                if (!assignedEmployeeUser) {
                    assignedEmployeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                        where: {
                            employeeUserId: dto.assignedEmployeeUserId,
                            active: true,
                        },
                        relations: {
                            role: true,
                            createdBy: true,
                            updatedBy: true,
                            pictureFile: true,
                        },
                    });
                    this.cacheService.set(assignedEmployeeUserKey, assignedEmployeeUser);
                }
                if (!assignedEmployeeUser) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                scanner.assignedEmployeeUser = Object.assign({}, assignedEmployeeUser);
                delete scanner.assignedEmployeeUser.createdBy;
                delete scanner.assignedEmployeeUser.updatedBy;
                scanner = await entityManager.save(Scanner_1.Scanner, scanner);
                (_a = scanner === null || scanner === void 0 ? void 0 : scanner.assignedEmployeeUser) === null || _a === void 0 ? true : delete _a.password;
                (_b = scanner === null || scanner === void 0 ? void 0 : scanner.assignedEmployeeUser) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                (_e = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _e === void 0 ? true : delete _e.password;
                (_f = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _f === void 0 ? true : delete _f.refreshToken;
                this.cacheService.del(cache_constant_1.CacheKeys.scanner.byId(scanner === null || scanner === void 0 ? void 0 : scanner.scannerId));
                this.cacheService.del(cache_constant_1.CacheKeys.scanner.byCode(scanner.scannerCode));
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.scanner.prefix);
                return scanner;
            });
        }
        catch (ex) {
            if (ex["message"] &&
                (ex["message"].includes("duplicate key") ||
                    ex["message"].includes("violates unique constraint")) &&
                ex["message"].includes("u_scanner")) {
                throw Error("Entry already exists!");
            }
            else {
                throw ex;
            }
        }
    }
    async delete(scannerCode, updatedByUserId) {
        return await this.scannerRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e, _f;
            const scannerKey = cache_constant_1.CacheKeys.scanner.byCode(scannerCode);
            let scanner = this.cacheService.get(scannerKey);
            if (!scanner) {
                scanner = await entityManager.findOne(Scanner_1.Scanner, {
                    where: {
                        scannerCode,
                        active: true,
                    },
                    relations: {
                        createdBy: true,
                        updatedBy: true,
                        assignedEmployeeUser: true,
                        location: true,
                        status: true,
                    },
                });
            }
            if (!scanner) {
                throw Error(scanner_constant_1.SCANNER_ERROR_NOT_FOUND);
            }
            scanner.active = false;
            scanner.lastUpdatedAt = await (0, utils_1.getDate)();
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
            scanner.updatedBy = Object.assign({}, updatedBy);
            delete scanner.updatedBy.createdBy;
            delete scanner.updatedBy.updatedBy;
            scanner = await entityManager.save(Scanner_1.Scanner, scanner);
            (_a = scanner === null || scanner === void 0 ? void 0 : scanner.assignedEmployeeUser) === null || _a === void 0 ? true : delete _a.password;
            (_b = scanner === null || scanner === void 0 ? void 0 : scanner.assignedEmployeeUser) === null || _b === void 0 ? true : delete _b.refreshToken;
            (_c = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _c === void 0 ? true : delete _c.password;
            (_d = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            (_e = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _e === void 0 ? true : delete _e.password;
            (_f = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _f === void 0 ? true : delete _f.refreshToken;
            this.cacheService.del(cache_constant_1.CacheKeys.scanner.byId(scanner === null || scanner === void 0 ? void 0 : scanner.scannerId));
            this.cacheService.del(cache_constant_1.CacheKeys.scanner.byCode(scanner.scannerCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.scanner.prefix);
            return scanner;
        });
    }
};
ScannerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Scanner_1.Scanner)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cache_service_1.CacheService])
], ScannerService);
exports.ScannerService = ScannerService;
//# sourceMappingURL=scanner.service.js.map