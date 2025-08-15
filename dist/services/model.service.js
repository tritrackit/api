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
exports.ModelService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const model_constant_1 = require("../common/constant/model.constant");
const utils_1 = require("../common/utils/utils");
const firebase_provider_1 = require("../core/provider/firebase/firebase-provider");
const Model_1 = require("../db/entities/Model");
const Units_1 = require("../db/entities/Units");
const typeorm_2 = require("typeorm");
const File_1 = require("../db/entities/File");
const EmployeeUsers_1 = require("../db/entities/EmployeeUsers");
const employee_user_error_constant_1 = require("../common/constant/employee-user-error.constant");
const utils_2 = require("../common/utils/utils");
const cloudinary_service_1 = require("./cloudinary.service");
const cache_constant_1 = require("../common/constant/cache.constant");
const cache_service_1 = require("./cache.service");
let ModelService = class ModelService {
    constructor(firebaseProvider, modelRepo, cloudinaryService, cacheService) {
        this.firebaseProvider = firebaseProvider;
        this.modelRepo = modelRepo;
        this.cloudinaryService = cloudinaryService;
        this.cacheService = cacheService;
    }
    async getPagination({ pageSize, pageIndex, order, keywords }) {
        const key = cache_constant_1.CacheKeys.model.list(pageIndex, pageSize, JSON.stringify(order), JSON.stringify(keywords));
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        let skip = 0;
        let take = Number(pageSize);
        if (Number(pageIndex) > 0) {
            skip = Number(pageIndex) * Number(pageSize);
        }
        else if (Number(pageIndex) === 0) {
            skip = 0;
            take = undefined;
        }
        keywords = keywords ? keywords : "";
        let field = "model.sequenceId";
        let direction = "ASC";
        if (order) {
            const [rawField, rawDirection] = Object.entries(order)[0];
            field = `model.${(0, utils_1.toCamelCase)(rawField)}`;
            const upperDir = String(rawDirection).toUpperCase();
            direction = upperDir === "ASC" ? "ASC" : "DESC";
        }
        const [results, total, models] = await Promise.all([
            this.modelRepo
                .createQueryBuilder("model")
                .leftJoinAndSelect("model.thumbnailFile", "thumbnailFile")
                .where(`model."Active" = true`)
                .andWhere(new typeorm_2.Brackets((qb) => {
                qb.where(`model."ModelName" ILIKE :keywords`, {
                    keywords: `%${keywords}%`,
                }).orWhere(`model."Description" ILIKE :keywords`, {
                    keywords: `%${keywords}%`,
                });
            }))
                .orderBy(field, direction)
                .skip(skip)
                .take(take)
                .getMany(),
            this.modelRepo
                .createQueryBuilder("model")
                .where(`model."Active" = true`)
                .andWhere(new typeorm_2.Brackets((qb) => {
                qb.where(`model."ModelName" ILIKE :keywords`, {
                    keywords: `%${keywords}%`,
                }).orWhere(`model."Description" ILIKE :keywords`, {
                    keywords: `%${keywords}%`,
                });
            }))
                .getCount(),
            this.modelRepo
                .createQueryBuilder("model")
                .where(`model."Active" = true`)
                .andWhere(new typeorm_2.Brackets((qb) => {
                qb.where(`model."ModelName" ILIKE :keywords`, {
                    keywords: `%${keywords}%`,
                }).orWhere(`model."Description" ILIKE :keywords`, {
                    keywords: `%${keywords}%`,
                });
            }))
                .getMany()
                .then(async (res) => {
                const modelIds = res.map((x) => x.modelId);
                const queryRes = modelIds.length > 0
                    ? await this.modelRepo.query(`
            SELECT c."ModelId" as "modelId",
            COUNT(p."UnitId")
            FROM dbo."Model" c
            LEFT JOIN dbo."Units" p ON c."ModelId" = p."ModelId"
            WHERE p."Active" = true AND c."ModelId" IN(${modelIds.join(",")})
            GROUP BY c."ModelId"`)
                    : [];
                return queryRes;
            }),
        ]);
        const response = {
            results: results.map((x) => {
                var _a, _b, _c, _d;
                x["unitCount"] = models.some((pc) => x.modelId.toString() === pc.modelId.toString())
                    ? models.find((pc) => x.modelId.toString() === pc.modelId.toString())
                        .count
                    : 0;
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
    async getById(modelId) {
        var _a, _b, _c, _d;
        const key = cache_constant_1.CacheKeys.model.byId(modelId);
        const cached = this.cacheService.get(key);
        if (cached)
            return cached;
        const [result, unitCount] = await Promise.all([
            this.modelRepo.findOne({
                where: { modelId, active: true },
                relations: { thumbnailFile: true },
            }),
            this.modelRepo.manager.count(Units_1.Units, {
                where: { model: { modelId } },
            }),
        ]);
        if (!result) {
            throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
        }
        result.unitCount = unitCount;
        (_a = result === null || result === void 0 ? void 0 : result.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = result === null || result === void 0 ? void 0 : result.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        this.cacheService.set(key, result);
        return result;
    }
    async create(dto, createdByUserId) {
        return await this.modelRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d;
            try {
                let model = new Model_1.Model();
                model.modelName = dto.modelName;
                model.description = dto.description;
                model.sequenceId = dto.sequenceId;
                model.dateCreated = await (0, utils_2.getDate)();
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
                model.createdBy = createdBy;
                model.createdBy = Object.assign({}, createdBy);
                delete model.createdBy.createdBy;
                delete model.createdBy.updatedBy;
                model = await entityManager.save(Model_1.Model, model);
                let uploaded;
                if (dto.thumbnailFile) {
                    uploaded = await this.cloudinaryService.uploadDataUri(dto.thumbnailFile.data, dto.thumbnailFile.fileName, "model");
                }
                if (uploaded) {
                    model.thumbnailFile = await entityManager.save(File_1.File, uploaded);
                }
                model = await entityManager.save(Model_1.Model, model);
                model = await entityManager.findOne(Model_1.Model, {
                    where: {
                        modelId: model === null || model === void 0 ? void 0 : model.modelId,
                    },
                    relations: {
                        thumbnailFile: true,
                    },
                });
                (_a = model === null || model === void 0 ? void 0 : model.createdBy) === null || _a === void 0 ? true : delete _a.password;
                (_b = model === null || model === void 0 ? void 0 : model.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                (_c = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                (_d = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.model.prefix);
                return model;
            }
            catch (ex) {
                if (ex.message.toLowerCase().includes("duplicate") &&
                    ex.message.toLowerCase().includes("sequenceid")) {
                    throw Error("Sequence already exist");
                }
                else if (ex.message.toLowerCase().includes("duplicate") &&
                    ex.message.toLowerCase().includes("name")) {
                    throw Error(model_constant_1.MODEL_ERROR_DUPLICATE);
                }
                else {
                    throw ex;
                }
            }
        });
    }
    async update(modelId, dto, updatedByUserId) {
        return await this.modelRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                const key = cache_constant_1.CacheKeys.model.byId(modelId);
                let model = this.cacheService.get(key);
                if (!model) {
                    model = await entityManager.findOne(Model_1.Model, {
                        where: {
                            modelId,
                            active: true,
                        },
                        relations: {
                            thumbnailFile: true,
                        },
                    });
                }
                if (!model) {
                    throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
                }
                model.modelName = dto.modelName;
                model.description = dto.description;
                model.sequenceId = dto.sequenceId;
                model.lastUpdatedAt = await (0, utils_2.getDate)();
                let uploaded;
                if (dto.thumbnailFile) {
                    if (model.thumbnailFile) {
                        try {
                            await this.cloudinaryService.deleteByPublicId((_a = model.thumbnailFile) === null || _a === void 0 ? void 0 : _a.publicId);
                        }
                        catch (ex) {
                            console.log(ex);
                        }
                    }
                    uploaded = await this.cloudinaryService.uploadDataUri(dto.thumbnailFile.data, dto.thumbnailFile.fileName, "model");
                }
                if (uploaded) {
                    uploaded.fileId = (_b = model.thumbnailFile) === null || _b === void 0 ? void 0 : _b.fileId;
                    model.thumbnailFile = await entityManager.save(File_1.File, uploaded);
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
                model.updatedBy = updatedBy;
                model.updatedBy = Object.assign({}, updatedBy);
                (_c = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _c === void 0 ? true : delete _c.createdBy;
                (_d = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _d === void 0 ? true : delete _d.updatedBy;
                model = await entityManager.save(Model_1.Model, model);
                model = await entityManager.findOne(Model_1.Model, {
                    where: {
                        modelId: model === null || model === void 0 ? void 0 : model.modelId,
                    },
                    relations: {
                        thumbnailFile: true,
                    },
                });
                (_e = model === null || model === void 0 ? void 0 : model.createdBy) === null || _e === void 0 ? true : delete _e.password;
                (_f = model === null || model === void 0 ? void 0 : model.createdBy) === null || _f === void 0 ? true : delete _f.refreshToken;
                (_g = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _g === void 0 ? true : delete _g.password;
                (_h = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _h === void 0 ? true : delete _h.refreshToken;
                this.cacheService.del(cache_constant_1.CacheKeys.model.byId(model === null || model === void 0 ? void 0 : model.modelId));
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.model.prefix);
                return model;
            }
            catch (ex) {
                if (ex.message.includes("duplicate")) {
                    throw Error(model_constant_1.MODEL_ERROR_DUPLICATE);
                }
                else {
                    throw ex;
                }
            }
        });
    }
    async updateOrder(dtos, updatedByUserId) {
        return await this.modelRepo.manager.transaction(async (entityManager) => {
            var _a, _b;
            try {
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
                const sequenceMap = new Map(dtos.map((dto) => [dto.modelId, dto.sequenceId]));
                const ids = Array.from(sequenceMap.keys());
                const modelsById = new Map();
                const dbMisses = [];
                for (const id of ids) {
                    const ck = cache_constant_1.CacheKeys.model.byId
                        ? cache_constant_1.CacheKeys.model.byId(id)
                        : `model:id:${id}`;
                    const cached = this.cacheService.get(ck);
                    if (cached) {
                        modelsById.set(String(id), Object.assign({}, cached));
                    }
                    else {
                        dbMisses.push(String(id));
                    }
                }
                if (dbMisses.length) {
                    const fetched = await entityManager.find(Model_1.Model, {
                        where: { modelId: (0, typeorm_2.In)(dbMisses) },
                    });
                    for (const m of fetched) {
                        const mId = String(m.modelId);
                        modelsById.set(mId, m);
                        const ck = cache_constant_1.CacheKeys.model.byId
                            ? cache_constant_1.CacheKeys.model.byId(mId)
                            : `model:id:${mId}`;
                        this.cacheService.set(ck, m);
                    }
                }
                const models = ids
                    .map((id) => modelsById.get(String(id)))
                    .filter((m) => !!m);
                if (models.length !== ids.length) {
                    throw new Error("Some models specified in the request were not found.");
                }
                let tempSequence = Math.max(...models.map((cat) => parseInt(cat.sequenceId))) + 1;
                for (const model of models) {
                    model.sequenceId = (tempSequence++).toString();
                    model.lastUpdatedAt = await (0, utils_2.getDate)();
                    model.updatedBy = Object.assign({}, updatedBy);
                    (_a = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _a === void 0 ? true : delete _a.createdBy;
                    (_b = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _b === void 0 ? true : delete _b.updatedBy;
                }
                await entityManager.save(models);
                for (const model of models) {
                    const newSequence = sequenceMap.get(model.modelId);
                    if (newSequence !== undefined) {
                        model.sequenceId = newSequence;
                    }
                    model.lastUpdatedAt = await (0, utils_2.getDate)();
                    model.updatedBy = updatedBy;
                }
                await entityManager.save(models);
                this.cacheService.delByPrefix(cache_constant_1.CacheKeys.model.prefix);
                return models.map((x) => {
                    var _a, _b, _c, _d;
                    (_a = x === null || x === void 0 ? void 0 : x.createdBy) === null || _a === void 0 ? true : delete _a.password;
                    (_b = x === null || x === void 0 ? void 0 : x.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
                    (_c = x === null || x === void 0 ? void 0 : x.updatedBy) === null || _c === void 0 ? true : delete _c.password;
                    (_d = x === null || x === void 0 ? void 0 : x.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
                    return x;
                });
            }
            catch (ex) {
                console.error("Error updating order:", ex);
                throw ex;
            }
        });
    }
    async delete(modelId, updatedByUserId) {
        return await this.modelRepo.manager.transaction(async (entityManager) => {
            var _a, _b, _c, _d, _e, _f, _g;
            const key = cache_constant_1.CacheKeys.model.byId(modelId);
            let model = this.cacheService.get(key);
            if (!model) {
                model = await entityManager.findOne(Model_1.Model, {
                    where: {
                        modelId,
                        active: true,
                    },
                    relations: {
                        thumbnailFile: true,
                    },
                });
            }
            if (!model) {
                throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
            }
            model.active = false;
            model.lastUpdatedAt = await (0, utils_2.getDate)();
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
            model.updatedBy = Object.assign({}, updatedBy);
            (_a = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _a === void 0 ? true : delete _a.createdBy;
            (_b = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _b === void 0 ? true : delete _b.updatedBy;
            if (model.thumbnailFile) {
                try {
                    await this.cloudinaryService.deleteByPublicId((_c = model.thumbnailFile) === null || _c === void 0 ? void 0 : _c.publicId);
                }
                catch (ex) {
                    console.log(ex);
                }
            }
            model = await entityManager.save(Model_1.Model, model);
            (_d = model === null || model === void 0 ? void 0 : model.createdBy) === null || _d === void 0 ? true : delete _d.password;
            (_e = model === null || model === void 0 ? void 0 : model.createdBy) === null || _e === void 0 ? true : delete _e.refreshToken;
            (_f = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _f === void 0 ? true : delete _f.password;
            (_g = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _g === void 0 ? true : delete _g.refreshToken;
            this.cacheService.del(cache_constant_1.CacheKeys.model.byId(model === null || model === void 0 ? void 0 : model.modelId));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.model.prefix);
            return model;
        });
    }
};
ModelService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(Model_1.Model)),
    __metadata("design:paramtypes", [firebase_provider_1.FirebaseProvider,
        typeorm_2.Repository,
        cloudinary_service_1.CloudinaryService,
        cache_service_1.CacheService])
], ModelService);
exports.ModelService = ModelService;
//# sourceMappingURL=model.service.js.map