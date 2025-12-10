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
const utils_1 = require("../common/utils/utils");
const typeorm_2 = require("typeorm");
const cache_constant_1 = require("../common/constant/cache.constant");
const cache_service_1 = require("./cache.service");
let LocationsService = class LocationsService {
    constructor(locationsRepo, cacheService) {
        this.locationsRepo = locationsRepo;
        this.cacheService = cacheService;
    }
    async getPagination({ pageSize, pageIndex, order, columnDef }) {
        const key = cache_constant_1.CacheKeys.locations.list(pageSize, pageIndex, JSON.stringify(order), JSON.stringify(columnDef));
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
        const take = Number(pageSize);
        const condition = (0, utils_1.columnDefToTypeORMCondition)(columnDef);
        const fixedLocationCondition = {
            locationId: (0, typeorm_2.In)(locations_constant_1.FIXED_LOCATION_IDS),
            active: true
        };
        const [results, total] = await Promise.all([
            this.locationsRepo.find({
                where: Object.assign(Object.assign({}, condition), fixedLocationCondition),
                relations: {
                    createdBy: true,
                    updatedBy: true,
                },
                skip,
                take,
                order,
            }),
            this.locationsRepo.count({
                where: Object.assign(Object.assign({}, condition), fixedLocationCondition),
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
    async getById(locationId) {
        var _a, _b, _c, _d, _e;
        if (!locations_constant_1.FIXED_LOCATION_IDS.includes(locationId)) {
            throw Error(locations_constant_1.LOCATIONS_ERROR_NOT_FOUND);
        }
        const key = cache_constant_1.CacheKeys.locations.byId(locationId);
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
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
        this.cacheService.set(key, result);
        return result;
    }
    async getFixedLocation(locationType) {
        const fixedLocation = locations_constant_1.FIXED_LOCATIONS[locationType];
        const location = await this.locationsRepo.findOne({
            where: {
                locationId: fixedLocation.id,
                active: true
            }
        });
        if (!location) {
            throw Error(`Fixed location "${fixedLocation.name}" not found. Run system reset.`);
        }
        return location;
    }
    async getAllFixedLocations() {
        return await this.locationsRepo.find({
            where: {
                locationId: (0, typeorm_2.In)(locations_constant_1.FIXED_LOCATION_IDS),
                active: true
            },
            order: { name: 'ASC' }
        });
    }
    async getOpenArea() {
        return await this.getFixedLocation('OPEN_AREA');
    }
    async getWarehouse5() {
        return await this.getFixedLocation('WAREHOUSE_5');
    }
};
LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Locations_1.Locations)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        cache_service_1.CacheService])
], LocationsService);
exports.LocationsService = LocationsService;
//# sourceMappingURL=locations.service.js.map