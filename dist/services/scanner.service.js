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
let ScannerService = class ScannerService {
    constructor(scannerRepo) {
        this.scannerRepo = scannerRepo;
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
        const take = Number(pageSize);
        const condition = (0, utils_1.columnDefToTypeORMCondition)(columnDef);
        const [results, total] = await Promise.all([
            this.scannerRepo.find({
                where: Object.assign(Object.assign({}, condition), { active: true }),
                relations: {
                    createdBy: true,
                    updatedBy: true,
                },
                skip,
                take,
                order,
            }),
            this.scannerRepo.count({
                where: Object.assign(Object.assign({}, condition), { active: true }),
            }),
        ]);
        return {
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
    }
    async getById(scannerId) {
        var _a, _b, _c, _d;
        const result = await this.scannerRepo.findOne({
            where: {
                scannerId,
                active: true,
            },
            relations: {
                createdBy: true,
                updatedBy: true,
            },
        });
        if (!result) {
            throw Error(scanner_constant_1.SCANNER_ERROR_NOT_FOUND);
        }
        (_a = result === null || result === void 0 ? void 0 : result.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = result === null || result === void 0 ? void 0 : result.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        return result;
    }
    async create(dto, createdByUserId) {
        try {
            return await this.scannerRepo.manager.transaction(async (entityManager) => {
                var _a, _b, _c, _d;
                let scanner = new Scanner_1.Scanner();
                scanner.scannerCode = dto.scannerCode;
                scanner.name = dto.name;
                scanner.dateCreated = await (0, utils_1.getDate)();
                const status = await entityManager.findOne(Status_1.Status, {
                    where: {
                        statusId: dto.statusId,
                    },
                });
                if (!status) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                scanner.status = status;
                const location = await entityManager.findOne(Locations_1.Locations, {
                    where: {
                        locationId: dto.locationId,
                        active: true,
                    },
                });
                if (!location) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                scanner.location = location;
                const assignedEmployeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: dto.assignedEmployeeUserId,
                        active: true,
                    },
                });
                if (!assignedEmployeeUser) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                scanner.assignedEmployeeUser = assignedEmployeeUser;
                const createdBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: createdByUserId,
                        active: true,
                    },
                });
                if (!createdBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                scanner.createdBy = createdBy;
                scanner = await entityManager.save(Scanner_1.Scanner, scanner);
                (_a = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
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
    async update(scannerCode, dto, updatedByUserId) {
        try {
            return await this.scannerRepo.manager.transaction(async (entityManager) => {
                var _a, _b, _c, _d;
                let scanner = await entityManager.findOne(Scanner_1.Scanner, {
                    where: {
                        scannerCode,
                        active: true,
                    },
                });
                if (!scanner) {
                    throw Error(scanner_constant_1.SCANNER_ERROR_NOT_FOUND);
                }
                scanner.lastUpdatedAt = await (0, utils_1.getDate)();
                const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: updatedByUserId,
                        active: true,
                    },
                });
                if (!updatedBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                scanner.updatedBy = updatedBy;
                scanner.scannerCode = dto.scannerCode;
                scanner.name = dto.name;
                const location = await entityManager.findOne(Locations_1.Locations, {
                    where: {
                        locationId: dto.locationId,
                        active: true,
                    },
                });
                if (!location) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                scanner.location = location;
                const assignedEmployeeUser = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: dto.assignedEmployeeUserId,
                        active: true,
                    },
                });
                if (!assignedEmployeeUser) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                scanner.assignedEmployeeUser = assignedEmployeeUser;
                scanner = await entityManager.save(Scanner_1.Scanner, scanner);
                (_a = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
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
            var _a, _b, _c, _d;
            let scanner = await entityManager.findOne(Scanner_1.Scanner, {
                where: {
                    scannerCode,
                    active: true,
                },
            });
            if (!scanner) {
                throw Error(scanner_constant_1.SCANNER_ERROR_NOT_FOUND);
            }
            scanner.active = false;
            scanner.lastUpdatedAt = await (0, utils_1.getDate)();
            const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserId: updatedByUserId,
                    active: true,
                },
            });
            if (!updatedBy) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            scanner.updatedBy = updatedBy;
            scanner = await entityManager.save(Scanner_1.Scanner, scanner);
            (_a = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _a === void 0 ? true : delete _a.password;
            (_b = scanner === null || scanner === void 0 ? void 0 : scanner.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
            (_c = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _c === void 0 ? true : delete _c.password;
            (_d = scanner === null || scanner === void 0 ? void 0 : scanner.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            return scanner;
        });
    }
};
ScannerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Scanner_1.Scanner)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ScannerService);
exports.ScannerService = ScannerService;
//# sourceMappingURL=scanner.service.js.map