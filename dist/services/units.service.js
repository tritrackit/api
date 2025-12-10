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
var UnitsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitsService = void 0;
const Locations_1 = require("../db/entities/Locations");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const units_constant_1 = require("../common/constant/units.constant");
const employee_user_error_constant_1 = require("../common/constant/employee-user-error.constant");
const utils_1 = require("../common/utils/utils");
const unit_create_dto_1 = require("../core/dto/unit/unit.create.dto");
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
let UnitsService = UnitsService_1 = class UnitsService {
    constructor(unitsRepo, pusherService, cacheService) {
        this.unitsRepo = unitsRepo;
        this.pusherService = pusherService;
        this.cacheService = cacheService;
        this.logger = new common_1.Logger(UnitsService_1.name);
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
                const statusKey = cache_constant_1.CacheKeys.status.byId(status_constants_1.STATUS.FOR_DELIVERY.toString());
                let status = this.cacheService.get(statusKey);
                if (!status) {
                    status = await entityManager.findOne(Status_1.Status, {
                        where: {
                            statusId: status_constants_1.STATUS.FOR_DELIVERY.toString(),
                        },
                    });
                    this.cacheService.set(statusKey, status);
                }
                if (!status) {
                    throw Error("Status not found");
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
    cleanUnitResponse(unit) {
        var _a, _b;
        if (!unit)
            return unit;
        const cleaned = Object.assign({}, unit);
        if (cleaned.createdBy) {
            cleaned.createdBy = this.cleanEmployeeUser(cleaned.createdBy);
        }
        if (cleaned.updatedBy) {
            cleaned.updatedBy = this.cleanEmployeeUser(cleaned.updatedBy);
        }
        if ((_a = cleaned.location) === null || _a === void 0 ? void 0 : _a.createdBy) {
            cleaned.location.createdBy = this.cleanEmployeeUser(cleaned.location.createdBy);
        }
        if ((_b = cleaned.location) === null || _b === void 0 ? void 0 : _b.updatedBy) {
            cleaned.location.updatedBy = this.cleanEmployeeUser(cleaned.location.updatedBy);
        }
        return cleaned;
    }
    cleanEmployeeUser(employeeUser) {
        if (!employeeUser)
            return employeeUser;
        const cleaned = Object.assign({}, employeeUser);
        delete cleaned.password;
        delete cleaned.refreshToken;
        delete cleaned.createdBy;
        delete cleaned.updatedBy;
        if (cleaned.role) {
            delete cleaned.role.createdBy;
            delete cleaned.role.updatedBy;
        }
        return cleaned;
    }
    cleanLocation(location) {
        if (!location)
            return location;
        const cleaned = Object.assign({}, location);
        delete cleaned.createdBy;
        delete cleaned.updatedBy;
        return cleaned;
    }
    cleanLocationUpdateResponse(response) {
        if (!response)
            return response;
        const cleaned = Object.assign({}, response);
        if (cleaned.unit) {
            cleaned.unit = this.cleanUnitResponse(cleaned.unit);
        }
        if (cleaned.previousLocation) {
            cleaned.previousLocation = this.cleanLocation(cleaned.previousLocation);
        }
        if (cleaned.newLocation) {
            cleaned.newLocation = this.cleanLocation(cleaned.newLocation);
        }
        return cleaned;
    }
    async createWithScannerStatus(dto, createdByUserId, status) {
        return await this.unitsRepo.manager.transaction(async (entityManager) => {
            let unit = new Units_1.Units();
            unit.rfid = dto.rfid;
            unit.chassisNo = dto.chassisNo;
            unit.color = dto.color;
            unit.description = dto.description;
            unit.dateCreated = await (0, utils_1.getDate)();
            const model = await entityManager.findOne(Model_1.Model, {
                where: { modelId: dto.modelId }
            });
            if (!model)
                throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
            unit.model = model;
            unit.status = status;
            const location = await entityManager.findOne(Locations_1.Locations, {
                where: { locationId: dto.locationId, active: true }
            });
            if (!location)
                throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
            unit.location = location;
            const createdBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: { employeeUserId: createdByUserId, active: true }
            });
            if (!createdBy)
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            unit.createdBy = createdBy;
            unit = await entityManager.save(Units_1.Units, unit);
            unit.unitCode = `U-${(0, utils_1.generateIndentityCode)(unit.unitId)}`;
            await entityManager.save(Units_1.Units, unit);
            const unitLogs = new UnitLogs_1.UnitLogs();
            unitLogs.timestamp = await (0, utils_1.getDate)();
            unitLogs.unit = unit;
            unitLogs.status = status;
            unitLogs.location = location;
            unitLogs.employeeUser = createdBy;
            await entityManager.save(UnitLogs_1.UnitLogs, unitLogs);
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.units.prefix);
            const result = await entityManager.findOne(Units_1.Units, {
                where: { unitId: unit.unitId, active: true },
                relations: ["model", "location", "status", "createdBy", "updatedBy"]
            });
            return this.cleanUnitResponse(result);
        });
    }
    async registerUnit(rfid, scannerCode, additionalData = {}) {
        return await this.unitsRepo.manager.transaction(async (entityManager) => {
            var _a;
            const scanner = await entityManager.findOne(Scanner_1.Scanner, {
                where: {
                    scannerCode,
                    active: true,
                    scannerType: "REGISTRATION"
                },
                relations: ["location", "status"]
            });
            if (!scanner) {
                throw Error("Registration scanner not found");
            }
            const existingUnit = await entityManager.findOne(Units_1.Units, {
                where: { rfid, active: true }
            });
            if (existingUnit) {
                throw Error("Unit with this RFID already registered");
            }
            const createUnitDto = new unit_create_dto_1.CreateUnitDto();
            createUnitDto.rfid = rfid;
            createUnitDto.chassisNo = additionalData.chassisNo || `CH-${rfid}`;
            createUnitDto.color = additionalData.color || "Auto-Registered";
            createUnitDto.description = additionalData.description || `Auto-registered at ${scanner.location.name}`;
            createUnitDto.modelId = additionalData.modelId;
            createUnitDto.locationId = scanner.location.locationId;
            const result = await this.createWithScannerStatus(createUnitDto, (_a = scanner.assignedEmployeeUser) === null || _a === void 0 ? void 0 : _a.employeeUserId, scanner.status);
            return this.cleanUnitResponse(result);
        });
    }
    async updateUnitLocation(rfid, scannerCode) {
        const result = await this.unitsRepo.manager.transaction(async (entityManager) => {
            const scanner = await entityManager.findOne(Scanner_1.Scanner, {
                where: {
                    scannerCode,
                    active: true,
                    scannerType: "LOCATION"
                },
                relations: ["location", "status", "assignedEmployeeUser"]
            });
            if (!scanner) {
                throw Error("Location scanner not found");
            }
            const unit = await entityManager.findOne(Units_1.Units, {
                where: { rfid, active: true },
                relations: ["location", "status"]
            });
            if (!unit) {
                throw Error("Unit not found - please register first using registration scanner");
            }
            const previousLocation = unit.location;
            const previousStatus = unit.status;
            const scannerLocationId = scanner.location.locationId;
            const unitLocationId = unit.location.locationId;
            if (scannerLocationId === locations_constant_1.FIXED_LOCATIONS.WAREHOUSE_5.id) {
                if (unitLocationId === locations_constant_1.FIXED_LOCATIONS.WAREHOUSE_5.id) {
                    const openArea = await entityManager.findOne(Locations_1.Locations, {
                        where: { locationId: locations_constant_1.FIXED_LOCATIONS.OPEN_AREA.id, active: true }
                    });
                    const forDeliveryStatus = await entityManager.findOne(Status_1.Status, {
                        where: { statusId: status_constants_1.STATUS.FOR_DELIVERY.toString() }
                    });
                    if (!openArea || !forDeliveryStatus) {
                        throw Error("Configuration error: Open Area or FOR DELIVERY status not found");
                    }
                    unit.location = openArea;
                    unit.status = forDeliveryStatus;
                }
                else if (unitLocationId === locations_constant_1.FIXED_LOCATIONS.OPEN_AREA.id) {
                    unit.location = scanner.location;
                    unit.status = scanner.status;
                }
                else {
                    throw Error(`Unit must be in Open Area to enter Warehouse 5. Current location: ${unit.location.name}`);
                }
            }
            else {
                if (scannerLocationId === unitLocationId) {
                    throw Error(`Unit is already at ${scanner.location.name}. No update needed.`);
                }
                unit.location = scanner.location;
                unit.status = scanner.status;
            }
            unit.lastUpdatedAt = new Date();
            const updatedUnit = await entityManager.save(Units_1.Units, unit);
            const unitLog = new UnitLogs_1.UnitLogs();
            unitLog.timestamp = new Date();
            unitLog.unit = updatedUnit;
            unitLog.status = unit.status;
            unitLog.prevStatus = previousStatus;
            unitLog.location = unit.location;
            unitLog.employeeUser = scanner.assignedEmployeeUser;
            await entityManager.save(UnitLogs_1.UnitLogs, unitLog);
            return {
                unit: updatedUnit,
                previousLocation,
                newLocation: unit.location,
                previousStatus,
                newStatus: unit.status,
                action: scannerLocationId === locations_constant_1.FIXED_LOCATIONS.WAREHOUSE_5.id && unitLocationId === locations_constant_1.FIXED_LOCATIONS.WAREHOUSE_5.id ? "EXITED_WAREHOUSE_5" :
                    scannerLocationId === locations_constant_1.FIXED_LOCATIONS.WAREHOUSE_5.id && unitLocationId === locations_constant_1.FIXED_LOCATIONS.OPEN_AREA.id ? "ENTERED_WAREHOUSE_5" :
                        "LOCATION_UPDATED"
            };
        });
        const unitCacheKey = this.keyUnit(result.unit.rfid);
        const lastLogCacheKey = this.keyLastLog(result.unit.rfid);
        const unitCodeCacheKey = cache_constant_1.CacheKeys.units.byCode(result.unit.unitCode);
        this.cacheService.del(unitCacheKey);
        this.cacheService.del(lastLogCacheKey);
        this.cacheService.del(unitCodeCacheKey);
        this.cacheService.delByPrefix(cache_constant_1.CacheKeys.units.prefix);
        this.logger.debug(`Cache invalidated for unit ${result.unit.unitCode} (RFID: ${result.unit.rfid}) before Pusher trigger`);
        this.pusherService.reSync('units', {
            rfid: result.unit.rfid,
            action: result.action,
            location: result.newLocation.name,
            status: result.newStatus.name,
            previousLocation: result.previousLocation.name,
            previousStatus: result.previousStatus.name,
            unitCode: result.unit.unitCode,
            timestamp: new Date()
        });
        return this.cleanLocationUpdateResponse(result);
    }
    async update(unitCode, dto, updatedByUserId) {
        try {
            const result = await this.unitsRepo.manager.transaction(async (entityManager) => {
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
                const previousLocation = unit.location;
                const previousStatus = unit.status;
                let locationChanged = false;
                let statusChanged = false;
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
                if (dto.locationId) {
                    const locationKey = cache_constant_1.CacheKeys.locations.byId(dto.locationId);
                    let newLocation = this.cacheService.get(locationKey);
                    if (!newLocation) {
                        newLocation = await entityManager.findOne(Locations_1.Locations, {
                            where: {
                                locationId: dto.locationId,
                                active: true,
                            },
                        });
                        if (newLocation) {
                            this.cacheService.set(locationKey, newLocation);
                        }
                    }
                    if (!newLocation) {
                        throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                    }
                    if (unit.location.locationId !== newLocation.locationId) {
                        unit.location = newLocation;
                        locationChanged = true;
                        this.logger.debug(`Location changed: ${previousLocation.name} → ${newLocation.name}`);
                        if (newLocation.name === 'Delivered' || newLocation.locationCode === 'DELIVERED') {
                            const deliveredStatusKey = cache_constant_1.CacheKeys.status.byId(status_constants_1.STATUS.DELIVERED.toString());
                            let deliveredStatus = this.cacheService.get(deliveredStatusKey);
                            if (!deliveredStatus) {
                                deliveredStatus = await entityManager.findOne(Status_1.Status, {
                                    where: {
                                        statusId: status_constants_1.STATUS.DELIVERED.toString(),
                                    },
                                });
                                if (deliveredStatus) {
                                    this.cacheService.set(deliveredStatusKey, deliveredStatus);
                                }
                            }
                            if (deliveredStatus && unit.status.statusId !== deliveredStatus.statusId) {
                                unit.status = deliveredStatus;
                                statusChanged = true;
                                this.logger.debug(`Status auto-updated to DELIVERED (${status_constants_1.STATUS.DELIVERED}) because location is DELIVERED`);
                            }
                            else if (!deliveredStatus) {
                                this.logger.warn(`DELIVERED status (ID: ${status_constants_1.STATUS.DELIVERED}) not found in database.`);
                            }
                        }
                    }
                }
                if (dto.statusId) {
                    const statusKey = cache_constant_1.CacheKeys.status.byId(dto.statusId);
                    let newStatus = this.cacheService.get(statusKey);
                    if (!newStatus) {
                        newStatus = await entityManager.findOne(Status_1.Status, {
                            where: {
                                statusId: dto.statusId,
                            },
                        });
                        if (newStatus) {
                            this.cacheService.set(statusKey, newStatus);
                        }
                    }
                    if (!newStatus) {
                        throw Error("Status not found");
                    }
                    if (unit.status.statusId !== newStatus.statusId) {
                        unit.status = newStatus;
                        statusChanged = true;
                        this.logger.debug(`Status changed: ${previousStatus.name} → ${newStatus.name}`);
                        if (newStatus.statusId === status_constants_1.STATUS.DELIVERED.toString() || Number(newStatus.statusId) === status_constants_1.STATUS.DELIVERED) {
                            let deliveredLocation = null;
                            deliveredLocation = await entityManager.findOne(Locations_1.Locations, {
                                where: {
                                    locationCode: 'DELIVERED',
                                    active: true,
                                },
                            });
                            if (!deliveredLocation) {
                                deliveredLocation = await entityManager.findOne(Locations_1.Locations, {
                                    where: {
                                        name: 'Delivered',
                                        active: true,
                                    },
                                });
                            }
                            if (!deliveredLocation && locations_constant_1.FIXED_LOCATIONS.DELIVERED.id) {
                                const deliveredLocationKey = cache_constant_1.CacheKeys.locations.byId(locations_constant_1.FIXED_LOCATIONS.DELIVERED.id);
                                deliveredLocation = this.cacheService.get(deliveredLocationKey);
                                if (!deliveredLocation) {
                                    deliveredLocation = await entityManager.findOne(Locations_1.Locations, {
                                        where: {
                                            locationId: locations_constant_1.FIXED_LOCATIONS.DELIVERED.id,
                                            active: true,
                                        },
                                    });
                                    if (deliveredLocation) {
                                        this.cacheService.set(deliveredLocationKey, deliveredLocation);
                                    }
                                }
                            }
                            if (deliveredLocation && unit.location.locationId !== deliveredLocation.locationId) {
                                unit.location = deliveredLocation;
                                locationChanged = true;
                                this.logger.debug(`Location auto-updated to DELIVERED because status is DELIVERED`);
                            }
                            else if (!deliveredLocation) {
                                this.logger.warn(`DELIVERED location not found in database. Please ensure a location with name 'Delivered' or code 'DELIVERED' exists.`);
                            }
                        }
                    }
                }
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
                if (locationChanged || statusChanged) {
                    const unitLog = new UnitLogs_1.UnitLogs();
                    unitLog.timestamp = await (0, utils_1.getDate)();
                    unitLog.unit = unit;
                    unitLog.status = unit.status;
                    unitLog.prevStatus = previousStatus;
                    unitLog.location = unit.location;
                    unitLog.employeeUser = updatedBy;
                    await entityManager.save(UnitLogs_1.UnitLogs, unitLog);
                    this.logger.debug(`UnitLog created for manual update: location=${locationChanged}, status=${statusChanged}`);
                }
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
                return {
                    unit,
                    locationChanged,
                    statusChanged,
                    previousLocation,
                    previousStatus,
                    newLocation: unit.location,
                    newStatus: unit.status
                };
            });
            if (result.unit) {
                const pusherData = {
                    rfid: result.unit.rfid,
                    action: result.locationChanged || result.statusChanged ? 'LOCATION_UPDATED' : 'UNIT_UPDATED',
                    unitCode: result.unit.unitCode,
                    changes: {
                        rfid: dto.rfid,
                        chassisNo: dto.chassisNo,
                        color: dto.color,
                        description: dto.description,
                        modelId: dto.modelId
                    },
                    timestamp: new Date()
                };
                if (result.locationChanged || result.statusChanged) {
                    pusherData.location = result.newLocation.name;
                    pusherData.status = result.newStatus.name;
                    pusherData.previousLocation = result.previousLocation.name;
                    pusherData.previousStatus = result.previousStatus.name;
                }
                this.pusherService.reSync('units', pusherData);
                this.logger.debug(`Pusher event triggered for manual unit update: ${result.unit.unitCode} (location=${result.locationChanged}, status=${result.statusChanged})`);
            }
            return result.unit;
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
            var _a, _b, _c, _d, _e, _f, _g, _h;
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
            const savedUnitCode = unit.unitCode;
            const savedUnitId = unit.unitId;
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
            const deletedUnit = await entityManager.findOne(Units_1.Units, {
                where: {
                    unitId: savedUnitId,
                },
                relations: {
                    model: true,
                    location: true,
                    status: true,
                    createdBy: true,
                    updatedBy: true,
                },
            });
            if (!deletedUnit) {
                (_a = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = unit === null || unit === void 0 ? void 0 : unit.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = unit === null || unit === void 0 ? void 0 : unit.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                this.cacheService.del(cache_constant_1.CacheKeys.units.byCode(savedUnitCode));
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.units.prefix);
                return unit;
            }
            (_e = deletedUnit === null || deletedUnit === void 0 ? void 0 : deletedUnit.createdBy) === null || _e === void 0 ? true : delete _e.password;
            (_f = deletedUnit === null || deletedUnit === void 0 ? void 0 : deletedUnit.createdBy) === null || _f === void 0 ? true : delete _f.refreshToken;
            (_g = deletedUnit === null || deletedUnit === void 0 ? void 0 : deletedUnit.updatedBy) === null || _g === void 0 ? true : delete _g.password;
            (_h = deletedUnit === null || deletedUnit === void 0 ? void 0 : deletedUnit.updatedBy) === null || _h === void 0 ? true : delete _h.refreshToken;
            this.cacheService.del(cache_constant_1.CacheKeys.units.byCode(savedUnitCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.units.prefix);
            return deletedUnit;
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
        this.cacheService.set(key, scanner !== null && scanner !== void 0 ? scanner : null, { ttlSeconds: 5 });
        return scanner !== null && scanner !== void 0 ? scanner : null;
    }
    async getUnitCached(em, rfid) {
        const key = this.keyUnit(rfid);
        const cached = this.cacheService.get(key);
        if (cached !== undefined)
            return cached;
        const unit = await em.findOne(Units_1.Units, { where: { rfid, active: true }, relations: ["location", "status", "model"] });
        this.cacheService.set(key, unit !== null && unit !== void 0 ? unit : null, { ttlSeconds: 2 });
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
        this.cacheService.set(key, lastLog !== null && lastLog !== void 0 ? lastLog : null, { ttlSeconds: 1 });
        return lastLog !== null && lastLog !== void 0 ? lastLog : null;
    }
    async unitLogs(logsDto, scannerCode) {
        var _a;
        this.logger.debug('=== DEBUG unitLogs START ===');
        this.logger.debug(`Scanner Code: ${scannerCode}`);
        this.logger.debug(`Data received: ${JSON.stringify(logsDto.data)}`);
        const result = await this.unitsRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
            const unitLogs = [];
            const registerEvents = [];
            if (!((_a = logsDto === null || logsDto === void 0 ? void 0 : logsDto.data) === null || _a === void 0 ? void 0 : _a.length)) {
                this.logger.warn('No data in logsDto');
                return { unitLogs, rfidsToNotify: [], registerEvents: [] };
            }
            const scanner = await this.getScannerCached(entityManager, scannerCode);
            this.logger.debug(`Scanner found: ${scanner === null || scanner === void 0 ? void 0 : scanner.name}`);
            this.logger.debug(`Scanner Type: ${scanner === null || scanner === void 0 ? void 0 : scanner.scannerType}`);
            this.logger.debug(`Scanner Location: ${(_b = scanner === null || scanner === void 0 ? void 0 : scanner.location) === null || _b === void 0 ? void 0 : _b.name}`);
            this.logger.debug(`Scanner Status: ${(_c = scanner === null || scanner === void 0 ? void 0 : scanner.status) === null || _c === void 0 ? void 0 : _c.name} (${(_d = scanner === null || scanner === void 0 ? void 0 : scanner.status) === null || _d === void 0 ? void 0 : _d.statusId})`);
            if (!scanner) {
                this.logger.warn('Scanner not found!');
                return { unitLogs: [], rfidsToNotify: [], registerEvents: [] };
            }
            const unitMemo = new Map();
            const lastLogMemo = new Map();
            for (const log of logsDto.data) {
                const rfid = String(log.rfid);
                this.logger.debug(`=== Processing RFID: ${rfid} ===`);
                let unit = (_e = unitMemo.get(rfid)) !== null && _e !== void 0 ? _e : null;
                if (unit === null && !unitMemo.has(rfid)) {
                    unit = await this.getUnitCached(entityManager, rfid);
                    unitMemo.set(rfid, unit);
                }
                this.logger.debug(`Unit exists? ${!!unit}`);
                if (unit) {
                    this.logger.debug(`Unit Code: ${unit.unitCode}`);
                    this.logger.debug(`Current Location: ${(_f = unit.location) === null || _f === void 0 ? void 0 : _f.name} (${(_g = unit.location) === null || _g === void 0 ? void 0 : _g.locationId})`);
                    this.logger.debug(`Current Status: ${(_h = unit.status) === null || _h === void 0 ? void 0 : _h.name} (${(_j = unit.status) === null || _j === void 0 ? void 0 : _j.statusId})`);
                }
                if (!unit) {
                    if (scanner.scannerType === "REGISTRATION") {
                        this.logger.debug(`Registration scanner - sending registration event for new RFID`);
                        registerEvents.push({
                            rfid,
                            scannerCode,
                            timestamp: log.timestamp,
                            employeeUser: scanner.assignedEmployeeUser,
                            location: scanner.location,
                        });
                    }
                    else {
                        this.logger.error(`Location scanner "${scanner.name}" (${scannerCode}) scanned unregistered RFID: ${rfid}`);
                    }
                    continue;
                }
                if (scanner.scannerType === "LOCATION") {
                    try {
                        this.logger.debug(`Calling updateUnitLocation() for location scanner...`);
                        await this.updateUnitLocation(rfid, scannerCode);
                        this.logger.debug(`updateUnitLocation() success - Pusher triggered automatically`);
                        continue;
                    }
                    catch (error) {
                        this.logger.error(`updateUnitLocation() failed: ${error.message}`, error.stack);
                    }
                }
                let lastLog = (_k = lastLogMemo.get(rfid)) !== null && _k !== void 0 ? _k : null;
                if (lastLog === null && !lastLogMemo.has(rfid)) {
                    lastLog = await this.getLastLogCached(entityManager, rfid);
                    lastLogMemo.set(rfid, lastLog);
                }
                this.logger.debug(`Last Log Status: ${(_l = lastLog === null || lastLog === void 0 ? void 0 : lastLog.status) === null || _l === void 0 ? void 0 : _l.name} (${(_m = lastLog === null || lastLog === void 0 ? void 0 : lastLog.status) === null || _m === void 0 ? void 0 : _m.statusId})`);
                this.logger.debug(`Last Log Location: ${(_o = lastLog === null || lastLog === void 0 ? void 0 : lastLog.location) === null || _o === void 0 ? void 0 : _o.name}`);
                const newStatusId = Number((_p = scanner.status) === null || _p === void 0 ? void 0 : _p.statusId);
                this.logger.debug(`Scanner New Status: ${(_q = scanner.status) === null || _q === void 0 ? void 0 : _q.name} (${newStatusId})`);
                this.logger.debug(`Scanner New Location: ${(_r = scanner.location) === null || _r === void 0 ? void 0 : _r.name} (${(_s = scanner.location) === null || _s === void 0 ? void 0 : _s.locationId})`);
                if (!newStatusId) {
                    this.logger.warn('No status ID found in scanner, skipping');
                    continue;
                }
                const isSameLocation = ((_t = unit.location) === null || _t === void 0 ? void 0 : _t.locationId) === ((_u = scanner.location) === null || _u === void 0 ? void 0 : _u.locationId);
                this.logger.debug(`Same location? ${isSameLocation}`);
                if (scanner.scannerType === "REGISTRATION") {
                    const prevStatusId = (_w = Number((_v = lastLog === null || lastLog === void 0 ? void 0 : lastLog.status) === null || _v === void 0 ? void 0 : _v.statusId)) !== null && _w !== void 0 ? _w : status_constants_1.STATUS.FOR_DELIVERY;
                    const isForward = prevStatusId === null || newStatusId > prevStatusId;
                    this.logger.debug(`Registration scanner - Is Forward? ${isForward} (${prevStatusId} → ${newStatusId})`);
                    if (!isForward) {
                        this.logger.warn(`Registration scanner blocked - not forward progression`);
                        continue;
                    }
                }
                else {
                    this.logger.debug(`Location scanner - allowing any status change`);
                }
                const shouldCreateLog = !isSameLocation || (((_x = unit.status) === null || _x === void 0 ? void 0 : _x.statusId) !== ((_y = scanner.status) === null || _y === void 0 ? void 0 : _y.statusId));
                this.logger.debug(`Should create UnitLog? ${shouldCreateLog}`);
                this.logger.debug(`  - Location changed? ${!isSameLocation}`);
                this.logger.debug(`  - Status changed? ${((_z = unit.status) === null || _z === void 0 ? void 0 : _z.statusId) !== ((_0 = scanner.status) === null || _0 === void 0 ? void 0 : _0.statusId)}`);
                if (!shouldCreateLog) {
                    this.logger.debug(`No change needed - unit already at this location/status`);
                    continue;
                }
                this.logger.debug(`Creating UnitLog:`);
                this.logger.debug(`  Location: ${(_1 = unit.location) === null || _1 === void 0 ? void 0 : _1.name} → ${(_2 = scanner.location) === null || _2 === void 0 ? void 0 : _2.name}`);
                this.logger.debug(`  Status: ${(_3 = unit.status) === null || _3 === void 0 ? void 0 : _3.name} → ${(_4 = scanner.status) === null || _4 === void 0 ? void 0 : _4.name}`);
                this.logger.debug(`  Employee: ${(_5 = scanner.assignedEmployeeUser) === null || _5 === void 0 ? void 0 : _5.employeeUserCode}`);
                const unitLog = new UnitLogs_1.UnitLogs();
                unitLog.timestamp = new Date(log.timestamp);
                unitLog.unit = unit;
                unitLog.status = scanner.status;
                unitLog.prevStatus = (_6 = lastLog === null || lastLog === void 0 ? void 0 : lastLog.status) !== null && _6 !== void 0 ? _6 : null;
                unitLog.location = scanner.location;
                unitLog.employeeUser = scanner.assignedEmployeeUser;
                unitLogs.push(unitLog);
                this.logger.debug(`UnitLog added to batch`);
            }
            this.logger.debug(`=== Summary ===`);
            this.logger.debug(`UnitLogs to create: ${unitLogs.length}`);
            this.logger.debug(`Register events: ${registerEvents.length}`);
            if (unitLogs.length) {
                this.logger.log(`Saving ${unitLogs.length} UnitLogs to database...`);
                await entityManager.save(UnitLogs_1.UnitLogs, unitLogs);
            }
            else {
                this.logger.debug(`No UnitLogs to save`);
            }
            const rfidsToNotify = Array.from(new Set(unitLogs.map((l) => l.unit.rfid)));
            const dedup = new Set();
            const uniqueRegisterEvents = registerEvents.filter((e) => {
                const k = `${e.rfid}|${e.scannerCode}`;
                if (dedup.has(k))
                    return false;
                dedup.add(k);
                return true;
            });
            this.logger.debug(`Transaction completed`);
            return {
                unitLogs,
                rfidsToNotify,
                registerEvents: uniqueRegisterEvents
            };
        });
        if (result && typeof result === 'object' && 'rfidsToNotify' in result) {
            if (result.rfidsToNotify && result.rfidsToNotify.length > 0) {
                this.logger.debug(`Triggering Pusher events for ${result.rfidsToNotify.length} units (non-blocking)...`);
                result.rfidsToNotify.forEach((rfid) => {
                    this.pusherService.reSync('units', {
                        rfid: rfid,
                        action: 'LOCATION_UPDATED',
                        timestamp: new Date()
                    });
                });
            }
            if (result.registerEvents && result.registerEvents.length > 0) {
                this.logger.debug(`Triggering ${result.registerEvents.length} registration events via Pusher (non-blocking)...`);
                result.registerEvents
                    .filter((e) => { var _a; return !!((_a = e.employeeUser) === null || _a === void 0 ? void 0 : _a.employeeUserCode); })
                    .forEach((e) => {
                    var _a;
                    this.pusherService.sendTriggerRegister((_a = e.employeeUser) === null || _a === void 0 ? void 0 : _a.employeeUserCode, e);
                });
            }
            this.logger.debug(`All Pusher events triggered`);
            if (result.unitLogs && result.unitLogs.length) {
                const rfidsToUpdate = Array.from(new Set(result.unitLogs.map((l) => l.unit.rfid)));
                this.logger.debug(`Updating cache for ${rfidsToUpdate.length} RFIDs`);
                for (const rfid of rfidsToUpdate) {
                    const newest = (_a = result.unitLogs
                        .filter((l) => l.unit.rfid === rfid)
                        .sort((a, b) => +b.timestamp - +a.timestamp)[0]) !== null && _a !== void 0 ? _a : null;
                    this.cacheService.set(this.keyLastLog(rfid), newest, {
                        ttlSeconds: 1,
                    });
                }
            }
            this.logger.debug('=== DEBUG unitLogs END ===');
            return result.unitLogs;
        }
        this.logger.debug('=== DEBUG unitLogs END ===');
        return Array.isArray(result) ? result : [];
    }
    async getActivityHistory(unitCode, pageSize = 50, pageIndex = 0) {
        const unit = await this.unitsRepo.findOne({
            where: {
                unitCode,
                active: true,
            },
            select: ['unitId'],
        });
        if (!unit) {
            throw Error(units_constant_1.UNIT_ERROR_NOT_FOUND);
        }
        const cacheKey = `unit:history:${unitCode}:p${pageIndex}:s${pageSize}`;
        const cached = this.cacheService.get(cacheKey);
        if (cached) {
            return cached;
        }
        const skip = pageIndex * pageSize;
        const take = pageSize;
        const [results, total] = await Promise.all([
            this.unitsRepo.manager.find(UnitLogs_1.UnitLogs, {
                where: {
                    unit: { unitId: unit.unitId },
                },
                relations: {
                    unit: {
                        model: true,
                        location: true,
                        status: true,
                    },
                    location: true,
                    status: true,
                    prevStatus: true,
                    employeeUser: {
                        role: true,
                        pictureFile: true,
                    },
                },
                order: {
                    timestamp: 'DESC',
                },
                skip,
                take,
            }),
            this.unitsRepo.manager.count(UnitLogs_1.UnitLogs, {
                where: {
                    unit: { unitId: unit.unitId },
                },
            }),
        ]);
        const cleanedResults = results.map((log) => {
            var _a, _b, _c, _d;
            const cleaned = Object.assign({}, log);
            if (cleaned.employeeUser) {
                delete cleaned.employeeUser.password;
                delete cleaned.employeeUser.refreshToken;
                if (cleaned.employeeUser.role) {
                    delete cleaned.employeeUser.role.createdBy;
                    delete cleaned.employeeUser.role.updatedBy;
                }
            }
            if (cleaned.unit) {
                (_a = cleaned.unit.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = cleaned.unit.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = cleaned.unit.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = cleaned.unit.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            }
            return cleaned;
        });
        const response = {
            results: cleanedResults,
            total,
        };
        this.cacheService.set(cacheKey, response, { ttlSeconds: 30 });
        return response;
    }
};
UnitsService = UnitsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Units_1.Units)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        pusher_service_1.PusherService,
        cache_service_1.CacheService])
], UnitsService);
exports.UnitsService = UnitsService;
//# sourceMappingURL=units.service.js.map