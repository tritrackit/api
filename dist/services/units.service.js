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
exports.UnitsService = void 0;
const Locations_1 = require("../db/entities/Locations");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const units_constant_1 = require("../common/constant/units.constant");
const employee_user_error_constant_1 = require("../common/constant/employee-user-error.constant");
const utils_1 = require("../common/utils/utils");
const Units_1 = require("../db/entities/Units");
const EmployeeUsers_1 = require("../db/entities/EmployeeUsers");
const typeorm_2 = require("typeorm");
const locations_constant_1 = require("../common/constant/locations.constant");
const Status_1 = require("../db/entities/Status");
const status_constants_1 = require("../common/constant/status.constants");
const Model_1 = require("../db/entities/Model");
const model_constant_1 = require("../common/constant/model.constant");
const Scanner_1 = require("../db/entities/Scanner");
const UnitLogs_1 = require("../db/entities/UnitLogs");
const pusher_service_1 = require("./pusher.service");
let UnitsService = class UnitsService {
    constructor(unitsRepo, pusherService) {
        this.unitsRepo = unitsRepo;
        this.pusherService = pusherService;
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
        const take = Number(pageSize);
        const condition = (0, utils_1.columnDefToTypeORMCondition)(columnDef);
        const [results, total] = await Promise.all([
            this.unitsRepo.find({
                where: Object.assign(Object.assign({}, condition), { active: true }),
                relations: {
                    createdBy: true,
                    updatedBy: true,
                },
                skip,
                take,
                order,
            }),
            this.unitsRepo.count({
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
    async getById(unitId) {
        var _a, _b, _c, _d;
        const result = await this.unitsRepo.findOne({
            where: {
                unitId,
                active: true,
            },
            relations: {
                createdBy: true,
                updatedBy: true,
            },
        });
        if (!result) {
            throw Error(units_constant_1.UNIT_ERROR_NOT_FOUND);
        }
        (_a = result === null || result === void 0 ? void 0 : result.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = result === null || result === void 0 ? void 0 : result.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        return result;
    }
    async create(dto, createdByUserId) {
        try {
            return await this.unitsRepo.manager.transaction(async (entityManager) => {
                var _a, _b, _c, _d;
                let unit = new Units_1.Units();
                unit.rfid = dto.rfid;
                unit.chassisNo = dto.chassisNo;
                unit.color = dto.color;
                unit.description = dto.description;
                unit.dateCreated = await (0, utils_1.getDate)();
                const model = await entityManager.findOne(Model_1.Model, {
                    where: {
                        modelId: dto.modelId,
                    },
                });
                if (!model) {
                    throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
                }
                unit.model = model;
                const status = await entityManager.findOne(Status_1.Status, {
                    where: {
                        statusId: status_constants_1.STATUS.REGISTERED.toString(),
                    },
                });
                if (!status) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                unit.status = status;
                const location = await entityManager.findOne(Locations_1.Locations, {
                    where: {
                        locationId: dto.locationId,
                        active: true,
                    },
                });
                if (!location) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                unit.location = location;
                const createdBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: createdByUserId,
                        active: true,
                    },
                });
                if (!createdBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                unit.createdBy = createdBy;
                unit = await entityManager.save(Units_1.Units, unit);
                unit.unitCode = `U-${(0, utils_1.generateIndentityCode)(unit.unitId)}`;
                await entityManager.save(Units_1.Units, unit);
                unit = await entityManager.findOne(Units_1.Units, {
                    where: {
                        unitId: unit.unitId,
                        active: true,
                    },
                    relations: {
                        model: true,
                        location: true,
                        status: true,
                        createdBy: true,
                        updatedBy: true,
                    },
                });
                (_a = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                return unit;
            });
        }
        catch (ex) {
            if (ex["message"] &&
                (ex["message"].includes("duplicate key") ||
                    ex["message"].includes("violates unique constraint")) &&
                ex["message"].includes("u_units")) {
                throw Error("Entry already exists!");
            }
            else {
                throw ex;
            }
        }
    }
    async update(unitCode, dto, updatedByUserId) {
        try {
            return await this.unitsRepo.manager.transaction(async (entityManager) => {
                var _a, _b, _c, _d;
                let unit = await entityManager.findOne(Units_1.Units, {
                    where: {
                        unitCode,
                        active: true,
                    },
                });
                if (!unit) {
                    throw Error(units_constant_1.UNIT_ERROR_NOT_FOUND);
                }
                unit.rfid = dto.rfid;
                unit.chassisNo = dto.chassisNo;
                unit.color = dto.color;
                unit.description = dto.description;
                unit.lastUpdatedAt = await (0, utils_1.getDate)();
                const model = await entityManager.findOne(Model_1.Model, {
                    where: {
                        modelId: dto.modelId,
                    },
                });
                if (!model) {
                    throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
                }
                unit.model = model;
                const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: updatedByUserId,
                        active: true,
                    },
                });
                if (!updatedBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                unit.updatedBy = updatedBy;
                const location = await entityManager.findOne(Locations_1.Locations, {
                    where: {
                        locationId: dto.locationId,
                        active: true,
                    },
                });
                if (!location) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                unit.location = location;
                await entityManager.save(Units_1.Units, unit);
                unit = await entityManager.findOne(Units_1.Units, {
                    where: {
                        unitId: unit.unitId,
                        active: true,
                    },
                    relations: {
                        model: true,
                        location: true,
                        status: true,
                        createdBy: true,
                        updatedBy: true,
                    },
                });
                (_a = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                return unit;
            });
        }
        catch (ex) {
            if (ex["message"] &&
                (ex["message"].includes("duplicate key") ||
                    ex["message"].includes("violates unique constraint")) &&
                ex["message"].includes("u_units")) {
                throw Error("Entry already exists!");
            }
            else {
                throw ex;
            }
        }
    }
    async unitLogs(logsDto) {
        return await this.unitsRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e;
            const unitLogs = [];
            const registerEvents = [];
            for (const log of logsDto.data) {
                const [unit, scanner, lastLog] = await Promise.all([
                    entityManager.findOne(Units_1.Units, {
                        where: { rfid: log.rfid, active: true },
                    }),
                    entityManager.findOne(Scanner_1.Scanner, {
                        where: { scannerCode: log.scannerCode, active: true },
                        relations: {
                            status: true,
                            location: true,
                            assignedEmployeeUser: true,
                        },
                    }),
                    entityManager
                        .createQueryBuilder(UnitLogs_1.UnitLogs, "ul")
                        .innerJoin("ul.unit", "u")
                        .leftJoinAndSelect("ul.status", "status")
                        .leftJoinAndSelect("ul.location", "location")
                        .where("u.rfid = :rfid AND u.active = true", { rfid: log.rfid })
                        .orderBy("ul.timestamp", "DESC")
                        .limit(1)
                        .getOne(),
                ]);
                if (!scanner)
                    continue;
                if (!unit && scanner) {
                    registerEvents.push({
                        rfid: log.rfid,
                        scannerCode: log.scannerCode,
                        timestamp: log.timestamp,
                        employeeUserId: (_a = scanner === null || scanner === void 0 ? void 0 : scanner.assignedEmployeeUser) === null || _a === void 0 ? void 0 : _a.employeeUserId,
                    });
                    continue;
                }
                const newStatusId = Number((_b = scanner.status) === null || _b === void 0 ? void 0 : _b.statusId);
                if (!newStatusId)
                    continue;
                const prevStatusId = (_d = Number((_c = lastLog === null || lastLog === void 0 ? void 0 : lastLog.status) === null || _c === void 0 ? void 0 : _c.statusId)) !== null && _d !== void 0 ? _d : status_constants_1.STATUS.REGISTERED;
                const isForward = prevStatusId === null || newStatusId > prevStatusId;
                if (!isForward)
                    continue;
                const unitLog = new UnitLogs_1.UnitLogs();
                unitLog.timestamp = new Date(log.timestamp);
                unitLog.unit = unit;
                unitLog.status = scanner.status;
                unitLog.prevStatus = (_e = lastLog === null || lastLog === void 0 ? void 0 : lastLog.status) !== null && _e !== void 0 ? _e : null;
                unitLog.location = scanner.location;
                unitLog.employeeUser = scanner.assignedEmployeeUser;
                unitLogs.push(unitLog);
            }
            const tasks = [];
            if (unitLogs.length) {
                tasks.push(entityManager.save(UnitLogs_1.UnitLogs, unitLogs));
            }
            else {
                tasks.push(Promise.resolve());
            }
            if (registerEvents.length) {
                const dedup = new Set();
                const unique = registerEvents.filter((e) => {
                    const k = `${e.rfid}|${e.scannerCode}`;
                    if (dedup.has(k))
                        return false;
                    dedup.add(k);
                    return true;
                });
                const pusherCalls = unique
                    .filter((e) => !!e.employeeUserId)
                    .map((e) => this.pusherService.sendTriggerRegister(e.employeeUserId, e));
                tasks.push(pusherCalls.length
                    ? Promise.allSettled(pusherCalls)
                    : Promise.resolve([]));
            }
            else {
                tasks.push(Promise.resolve([]));
            }
            await Promise.all(tasks);
            return unitLogs;
        });
    }
    async delete(unitCode, updatedByUserId) {
        return await this.unitsRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            let unit = await entityManager.findOne(Units_1.Units, {
                where: {
                    unitCode,
                    active: true,
                },
            });
            if (!unit) {
                throw Error(units_constant_1.UNIT_ERROR_NOT_FOUND);
            }
            unit.active = false;
            unit.lastUpdatedAt = await (0, utils_1.getDate)();
            const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserId: updatedByUserId,
                    active: true,
                },
            });
            if (!updatedBy) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            unit.updatedBy = updatedBy;
            await entityManager.save(Units_1.Units, unit);
            unit = await entityManager.findOne(Units_1.Units, {
                where: {
                    unitId: unit.unitId,
                    active: true,
                },
                relations: {
                    model: true,
                    location: true,
                    status: true,
                    createdBy: true,
                    updatedBy: true,
                },
            });
            (_a = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _a === void 0 ? true : delete _a.password;
            (_b = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
            (_c = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _c === void 0 ? true : delete _c.password;
            (_d = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            return unit;
        });
    }
};
UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Units_1.Units)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        pusher_service_1.PusherService])
], UnitsService);
exports.UnitsService = UnitsService;
//# sourceMappingURL=units.service.js.map