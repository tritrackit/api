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
exports.LocationsService = void 0;
const Locations_1 = require("../db/entities/Locations");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const locations_constant_1 = require("../common/constant/locations.constant");
const employee_user_error_constant_1 = require("../common/constant/employee-user-error.constant");
const utils_1 = require("../common/utils/utils");
const EmployeeUsers_1 = require("../db/entities/EmployeeUsers");
const typeorm_2 = require("typeorm");
let LocationsService = class LocationsService {
    constructor(locationsRepo) {
        this.locationsRepo = locationsRepo;
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
        const take = Number(pageSize);
        const condition = (0, utils_1.columnDefToTypeORMCondition)(columnDef);
        const [results, total] = await Promise.all([
            this.locationsRepo.find({
                where: Object.assign(Object.assign({}, condition), { active: true }),
                relations: {
                    createdBy: true,
                    updatedBy: true,
                },
                skip,
                take,
                order,
            }),
            this.locationsRepo.count({
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
    async getById(locationId) {
        var _a, _b, _c, _d, _e;
        const result = await this.locationsRepo.findOne({
            where: {
                locationId,
                active: true,
            },
            relations: {
                createdBy: true,
                updatedBy: true,
            },
        });
        if (!result) {
            throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
        }
        delete result.createdBy.password;
        if ((_a = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _a === void 0 ? void 0 : _a.password) {
            delete result.updatedBy.password;
        }
        (_b = result === null || result === void 0 ? void 0 : result.createdBy) === null || _b === void 0 ? true : delete _b.password;
        (_c = result === null || result === void 0 ? void 0 : result.createdBy) === null || _c === void 0 ? true : delete _c.refreshToken;
        (_d = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _d === void 0 ? true : delete _d.password;
        (_e = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _e === void 0 ? true : delete _e.refreshToken;
        return result;
    }
    async create(dto, createdByUserId) {
        try {
            return await this.locationsRepo.manager.transaction(async (entityManager) => {
                var _a, _b, _c, _d;
                let locations = new Locations_1.Locations();
                locations.locationCode = dto.locationCode;
                locations.name = dto.name;
                locations.dateCreated = await (0, utils_1.getDate)();
                const createdBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: createdByUserId,
                        active: true,
                    },
                });
                if (!createdBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                locations.createdBy = createdBy;
                locations = await entityManager.save(Locations_1.Locations, locations);
                (_a = locations === null || locations === void 0 ? void 0 : locations.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = locations === null || locations === void 0 ? void 0 : locations.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = locations === null || locations === void 0 ? void 0 : locations.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = locations === null || locations === void 0 ? void 0 : locations.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                return locations;
            });
        }
        catch (ex) {
            if (ex["message"] &&
                (ex["message"].includes("duplicate key") ||
                    ex["message"].includes("violates unique constraint")) &&
                ex["message"].includes("u_locations")) {
                throw Error("Entry already exists!");
            }
            else {
                throw ex;
            }
        }
    }
    async update(locationId, dto, updatedByUserId) {
        try {
            return await this.locationsRepo.manager.transaction(async (entityManager) => {
                var _a, _b, _c, _d;
                let locations = await entityManager.findOne(Locations_1.Locations, {
                    where: {
                        locationId,
                        active: true,
                    },
                });
                if (!locations) {
                    throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
                }
                locations.locationCode = dto.locationCode;
                locations.name = dto.name;
                locations.lastUpdatedAt = await (0, utils_1.getDate)();
                const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: updatedByUserId,
                        active: true,
                    },
                });
                if (!updatedBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                locations.updatedBy = updatedBy;
                locations = await entityManager.save(Locations_1.Locations, locations);
                if ((_a = locations === null || locations === void 0 ? void 0 : locations.createdBy) === null || _a === void 0 ? void 0 : _a.password) {
                    delete locations.createdBy.password;
                }
                if ((_b = locations === null || locations === void 0 ? void 0 : locations.updatedBy) === null || _b === void 0 ? void 0 : _b.password) {
                    delete locations.updatedBy.password;
                }
                if ((_c = locations === null || locations === void 0 ? void 0 : locations.createdBy) === null || _c === void 0 ? void 0 : _c.refreshToken) {
                    delete locations.createdBy.refreshToken;
                }
                if ((_d = locations === null || locations === void 0 ? void 0 : locations.updatedBy) === null || _d === void 0 ? void 0 : _d.refreshToken) {
                    delete locations.updatedBy.refreshToken;
                }
                return locations;
            });
        }
        catch (ex) {
            if (ex["message"] &&
                (ex["message"].includes("duplicate key") ||
                    ex["message"].includes("violates unique constraint")) &&
                ex["message"].includes("u_locations")) {
                throw Error("Entry already exists!");
            }
            else {
                throw ex;
            }
        }
    }
    async delete(locationId, updatedByUserId) {
        return await this.locationsRepo.manager.transaction(async (entityManager) => {
            const locations = await entityManager.findOne(Locations_1.Locations, {
                where: {
                    locationId,
                    active: true,
                },
            });
            if (!locations) {
                throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
            }
            locations.active = false;
            locations.lastUpdatedAt = await (0, utils_1.getDate)();
            const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserId: updatedByUserId,
                    active: true,
                },
            });
            if (!updatedBy) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            locations.updatedBy = updatedBy;
            return await entityManager.save(Locations_1.Locations, locations);
        });
    }
};
LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Locations_1.Locations)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LocationsService);
exports.LocationsService = LocationsService;
//# sourceMappingURL=locations.service.js.map