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
const UnitLogs_1 = require("../db/entities/UnitLogs");
const pusher_service_1 = require("./pusher.service");
const cache_service_1 = require("./cache.service");
const cache_constant_1 = require("../common/constant/cache.constant");
const Scanner_1 = require("../db/entities/Scanner");
let UnitsService = class UnitsService {
    constructor(unitsRepo, pusherService, cacheService) {
        this.unitsRepo = unitsRepo;
        this.pusherService = pusherService;
        this.cacheService = cacheService;
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        const key = cache_constant_1.CacheKeys.units.list(pageIndex, pageSize, JSON.stringify(order), JSON.stringify(columnDef));
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
        const take = Number(pageSize);
        const condition = (0, utils_1.columnDefToTypeORMCondition)(columnDef);
        const [results, total] = await Promise.all([
            this.unitsRepo.find({
                where: Object.assign(Object.assign({}, condition), { active: true }),
                relations: {
                    createdBy: true,
                    updatedBy: true,
                    model: true,
                    status: true,
                    location: true,
                },
                skip,
                take,
                order,
            }),
            this.unitsRepo.count({
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
    async getByCode(unitCode) {
        var _a, _b, _c, _d;
        const key = cache_constant_1.CacheKeys.units.byCode(unitCode);
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const result = await this.unitsRepo.findOne({
            where: {
                unitCode,
                active: true,
            },
            relations: {
                createdBy: true,
                updatedBy: true,
                model: true,
                location: true,
                status: true,
            },
        });
        if (!result) {
            throw Error(units_constant_1.UNIT_ERROR_NOT_FOUND);
        }
        (_a = result === null || result === void 0 ? void 0 : result.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = result === null || result === void 0 ? void 0 : result.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        this.cacheService.set(key, result);
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
                const modelKey = cache_constant_1.CacheKeys.model.byId(dto.modelId);
                let model = this.cacheService.get(modelKey);
                if (!model) {
                    model = await entityManager.findOne(Model_1.Model, {
                        where: {
                            modelId: dto.modelId,
                        },
                        relations: {
                            createdBy: true,
                            updatedBy: true,
                        },
                    });
                    this.cacheService.set(modelKey, model);
                }
                if (!model) {
                    throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
                }
                unit.model = model;
                const statusKey = cache_constant_1.CacheKeys.status.byId(status_constants_1.STATUS.REGISTERED.toString());
                let status = this.cacheService.get(statusKey);
                if (!status) {
                    status = await entityManager.findOne(Status_1.Status, {
                        where: {
                            statusId: status_constants_1.STATUS.REGISTERED.toString(),
                        },
                    });
                    this.cacheService.set(statusKey, status);
                }
                if (!status) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                unit.status = status;
                const locationKey = cache_constant_1.CacheKeys.locations.byId(createdByUserId);
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
                unit.location = location;
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
                unit.createdBy = Object.assign({}, createdBy);
                delete unit.createdBy.createdBy;
                delete unit.createdBy.updatedBy;
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
                const unitLogs = new UnitLogs_1.UnitLogs();
                unitLogs.timestamp = await (0, utils_1.getDate)();
                unitLogs.unit = unit;
                unitLogs.status = status;
                unitLogs.location = location;
                unitLogs.employeeUser = createdBy;
                await entityManager.save(UnitLogs_1.UnitLogs, unitLogs);
                (_a = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.units.prefix);
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
                const unitKey = cache_constant_1.CacheKeys.units.byCode(unitCode);
                let unit = this.cacheService.get(unitKey);
                if (!unit) {
                    unit = await entityManager.findOne(Units_1.Units, {
                        where: {
                            unitCode,
                            active: true,
                        },
                        relations: {
                            createdBy: true,
                            updatedBy: true,
                            model: true,
                            location: true,
                            status: true,
                        },
                    });
                }
                if (!unit) {
                    throw Error(units_constant_1.UNIT_ERROR_NOT_FOUND);
                }
                unit.rfid = dto.rfid;
                unit.chassisNo = dto.chassisNo;
                unit.color = dto.color;
                unit.description = dto.description;
                unit.lastUpdatedAt = await (0, utils_1.getDate)();
                const modelKey = cache_constant_1.CacheKeys.model.byId(dto.modelId);
                let model = this.cacheService.get(modelKey);
                if (!model) {
                    model = await entityManager.findOne(Model_1.Model, {
                        where: {
                            modelId: dto.modelId,
                        },
                        relations: {
                            createdBy: true,
                            updatedBy: true,
                        },
                    });
                    this.cacheService.set(modelKey, model);
                }
                if (!model) {
                    throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
                }
                unit.model = model;
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
                unit.updatedBy = Object.assign({}, updatedBy);
                delete unit.updatedBy.createdBy;
                delete unit.updatedBy.updatedBy;
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
                this.cacheService.del(cache_constant_1.CacheKeys.units.byCode(unit.unitCode));
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.units.prefix);
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
    async delete(unitCode, updatedByUserId) {
        return await this.unitsRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            const unitKey = cache_constant_1.CacheKeys.units.byCode(unitCode);
            let unit = this.cacheService.get(unitKey);
            if (!unit) {
                unit = await entityManager.findOne(Units_1.Units, {
                    where: {
                        unitCode,
                        active: true,
                    },
                    relations: {
                        createdBy: true,
                        updatedBy: true,
                        model: true,
                        location: true,
                        status: true,
                    },
                });
            }
            if (!unit) {
                throw Error(units_constant_1.UNIT_ERROR_NOT_FOUND);
            }
            unit.active = false;
            unit.lastUpdatedAt = await (0, utils_1.getDate)();
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
            this.cacheService.del(cache_constant_1.CacheKeys.units.byCode(unit.unitCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.units.prefix);
            return unit;
        });
    }
    keyScanner(code) {
        return `scanner:code:${code}`;
    }
    keyUnit(rfid) {
        return `unit:rfid:${rfid}`;
    }
    keyLastLog(rfid) {
        return `unitlog:last:${rfid}`;
    }
    async getScannerCached(em, code) {
        const key = this.keyScanner(code);
        const cached = this.cacheService.get(key);
        if (cached !== undefined &&
            cached.status &&
            cached.location &&
            cached.assignedEmployeeUser)
            return cached;
        const scanner = await em.findOne(Scanner_1.Scanner, {
            where: { scannerCode: code, active: true },
            relations: { status: true, location: true, assignedEmployeeUser: true },
        });
        this.cacheService.set(key, scanner !== null && scanner !== void 0 ? scanner : null, { ttlSeconds: 15 });
        return scanner !== null && scanner !== void 0 ? scanner : null;
    }
    async getUnitCached(em, rfid) {
        const key = this.keyUnit(rfid);
        const cached = this.cacheService.get(key);
        if (cached !== undefined)
            return cached;
        const unit = await em.findOne(Units_1.Units, { where: { rfid, active: true } });
        this.cacheService.set(key, unit !== null && unit !== void 0 ? unit : null, { ttlSeconds: 20 });
        return unit !== null && unit !== void 0 ? unit : null;
    }
    async getLastLogCached(em, rfid) {
        const key = this.keyLastLog(rfid);
        const cached = this.cacheService.get(key);
        if (cached !== undefined)
            return cached;
        const lastLog = await em
            .createQueryBuilder(UnitLogs_1.UnitLogs, "ul")
            .innerJoin("ul.unit", "u")
            .leftJoinAndSelect("ul.status", "status")
            .leftJoinAndSelect("ul.location", "location")
            .where("u.rfid = :rfid AND u.active = true", { rfid })
            .orderBy("ul.timestamp", "DESC")
            .limit(1)
            .getOne();
        this.cacheService.set(key, lastLog !== null && lastLog !== void 0 ? lastLog : null, { ttlSeconds: 10 });
        return lastLog !== null && lastLog !== void 0 ? lastLog : null;
    }
    async unitLogs(logsDto, scannerCode) {
        return await this.unitsRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            const unitLogs = [];
            const registerEvents = [];
            if (!((_a = logsDto === null || logsDto === void 0 ? void 0 : logsDto.data) === null || _a === void 0 ? void 0 : _a.length))
                return unitLogs;
            const scanner = await this.getScannerCached(entityManager, scannerCode);
            if (!scanner)
                return [];
            const unitMemo = new Map();
            const lastLogMemo = new Map();
            for (const log of logsDto.data) {
                const rfid = String(log.rfid);
                let unit = (_b = unitMemo.get(rfid)) !== null && _b !== void 0 ? _b : null;
                if (unit === null && !unitMemo.has(rfid)) {
                    unit = await this.getUnitCached(entityManager, rfid);
                    unitMemo.set(rfid, unit);
                }
                if (!unit) {
                    registerEvents.push({
                        rfid,
                        scannerCode,
                        timestamp: log.timestamp,
                        employeeUser: scanner.assignedEmployeeUser,
                        location: scanner.location,
                    });
                    continue;
                }
                let lastLog = (_c = lastLogMemo.get(rfid)) !== null && _c !== void 0 ? _c : null;
                if (lastLog === null && !lastLogMemo.has(rfid)) {
                    lastLog = await this.getLastLogCached(entityManager, rfid);
                    lastLogMemo.set(rfid, lastLog);
                }
                const newStatusId = Number((_d = scanner.status) === null || _d === void 0 ? void 0 : _d.statusId);
                if (!newStatusId)
                    continue;
                const prevStatusId = (_f = Number((_e = lastLog === null || lastLog === void 0 ? void 0 : lastLog.status) === null || _e === void 0 ? void 0 : _e.statusId)) !== null && _f !== void 0 ? _f : status_constants_1.STATUS.REGISTERED;
                const isForward = prevStatusId === null || newStatusId > prevStatusId;
                if (!isForward)
                    continue;
                const unitLog = new UnitLogs_1.UnitLogs();
                unitLog.timestamp = new Date(log.timestamp);
                unitLog.unit = unit;
                unitLog.status = scanner.status;
                unitLog.prevStatus = (_g = lastLog === null || lastLog === void 0 ? void 0 : lastLog.status) !== null && _g !== void 0 ? _g : null;
                unitLog.location = scanner.location;
                unitLog.employeeUser = scanner.assignedEmployeeUser;
                unitLogs.push(unitLog);
            }
            const tasks = [];
            if (unitLogs.length)
                tasks.push(entityManager.save(UnitLogs_1.UnitLogs, unitLogs));
            else
                tasks.push(Promise.resolve());
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
                    .filter((e) => { var _a; return !!((_a = e.employeeUser) === null || _a === void 0 ? void 0 : _a.employeeUserCode); })
                    .map((e) => { var _a; return this.pusherService.sendTriggerRegister((_a = e.employeeUser) === null || _a === void 0 ? void 0 : _a.employeeUserCode, e); });
                tasks.push(pusherCalls.length
                    ? Promise.allSettled(pusherCalls)
                    : Promise.resolve([]));
            }
            else {
                tasks.push(Promise.resolve([]));
            }
            await Promise.all(tasks);
            if (unitLogs.length) {
                const rfidsToUpdate = Array.from(new Set(unitLogs.map((l) => l.unit.rfid)));
                for (const rfid of rfidsToUpdate) {
                    const newest = (_h = unitLogs
                        .filter((l) => l.unit.rfid === rfid)
                        .sort((a, b) => +b.timestamp - +a.timestamp)[0]) !== null && _h !== void 0 ? _h : null;
                    this.cacheService.set(this.keyLastLog(rfid), newest, {
                        ttlSeconds: 10,
                    });
                }
            }
            return unitLogs;
        });
    }
};
UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Units_1.Units)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        pusher_service_1.PusherService,
        cache_service_1.CacheService])
], UnitsService);
exports.UnitsService = UnitsService;
//# sourceMappingURL=units.service.js.map