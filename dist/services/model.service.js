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
const path_1 = require("path");
const model_constant_1 = require("../common/constant/model.constant");
const utils_1 = require("../common/utils/utils");
const firebase_provider_1 = require("../core/provider/firebase/firebase-provider");
const Model_1 = require("../db/entities/Model");
const Units_1 = require("../db/entities/Units");
const typeorm_2 = require("typeorm");
const File_1 = require("../db/entities/File");
const uuid_1 = require("uuid");
const EmployeeUsers_1 = require("../db/entities/EmployeeUsers");
const employee_user_error_constant_1 = require("../common/constant/employee-user-error.constant");
const utils_2 = require("../common/utils/utils");
let ModelService = class ModelService {
    constructor(firebaseProvider, modelRepo) {
        this.firebaseProvider = firebaseProvider;
        this.modelRepo = modelRepo;
    }
    async getPagination({ pageSize, pageIndex, order, keywords }) {
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
            LEFT JOIN dbo."Unit" p ON c."ModelId" = p."ModelId"
            WHERE p."Active" = true AND c."ModelId" IN(${modelIds.join(",")})
            GROUP BY c."ModelId"`)
                    : [];
                return queryRes;
            }),
        ]);
        return {
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
    }
    async getById(modelId) {
        var _a, _b, _c, _d;
        const result = await this.modelRepo.findOne({
            where: {
                modelId,
                active: true,
            },
            relations: {
                thumbnailFile: true,
            },
        });
        if (!result) {
            throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
        }
        const unitCount = await this.modelRepo.manager.count(Units_1.Units, {
            where: {
                model: {
                    modelId,
                },
            },
        });
        (_a = result === null || result === void 0 ? void 0 : result.createdBy) === null || _a === void 0 ? true : delete _a.password;
        (_b = result === null || result === void 0 ? void 0 : result.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
        (_c = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _c === void 0 ? true : delete _c.password;
        (_d = result === null || result === void 0 ? void 0 : result.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
        return Object.assign(Object.assign({}, result), { unitCount });
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
                const createdBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: createdByUserId,
                        active: true,
                    },
                });
                if (!createdBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                model.createdBy = createdBy;
                model = await entityManager.save(Model_1.Model, model);
                if (dto.thumbnailFile) {
                    const bucket = this.firebaseProvider.app.storage().bucket();
                    model.thumbnailFile = new File_1.File();
                    const newGUID = (0, uuid_1.v4)();
                    const bucketFile = bucket.file(`model/${newGUID}${(0, path_1.extname)(dto.thumbnailFile.fileName)}`);
                    const img = Buffer.from(dto.thumbnailFile.data, "base64");
                    await bucketFile.save(img).then(async () => {
                        const url = await bucketFile.getSignedUrl({
                            action: "read",
                            expires: "03-09-2500",
                        });
                        model.thumbnailFile.guid = newGUID;
                        model.thumbnailFile.fileName = dto.thumbnailFile.fileName;
                        model.thumbnailFile.url = url[0];
                        model.thumbnailFile = await entityManager.save(File_1.File, model.thumbnailFile);
                    });
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
            var _a, _b, _c, _d;
            try {
                let model = await entityManager.findOne(Model_1.Model, {
                    where: {
                        modelId,
                        active: true,
                    },
                    relations: {
                        thumbnailFile: true,
                    },
                });
                if (!model) {
                    throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
                }
                model.modelName = dto.modelName;
                model.description = dto.description;
                model.sequenceId = dto.sequenceId;
                model.lastUpdatedAt = await (0, utils_2.getDate)();
                if (dto.thumbnailFile) {
                    const newGUID = (0, uuid_1.v4)();
                    const bucket = this.firebaseProvider.app.storage().bucket();
                    if (model.thumbnailFile) {
                        try {
                            const deleteFile = bucket.file(`model/${model.thumbnailFile.guid}${(0, path_1.extname)(model.thumbnailFile.fileName)}`);
                            const exists = await deleteFile.exists();
                            if (exists[0]) {
                                deleteFile.delete();
                            }
                        }
                        catch (ex) {
                            console.log(ex);
                        }
                        const file = model.thumbnailFile;
                        file.guid = newGUID;
                        file.fileName = dto.thumbnailFile.fileName;
                        const bucketFile = bucket.file(`model/${newGUID}${(0, path_1.extname)(dto.thumbnailFile.fileName)}`);
                        const img = Buffer.from(dto.thumbnailFile.data, "base64");
                        await bucketFile.save(img).then(async (res) => {
                            console.log("res");
                            console.log(res);
                            const url = await bucketFile.getSignedUrl({
                                action: "read",
                                expires: "03-09-2500",
                            });
                            file.url = url[0];
                            model.thumbnailFile = await entityManager.save(File_1.File, file);
                        });
                    }
                    else {
                        model.thumbnailFile = new File_1.File();
                        model.thumbnailFile.guid = newGUID;
                        model.thumbnailFile.fileName = dto.thumbnailFile.fileName;
                        const bucketFile = bucket.file(`model/${newGUID}${(0, path_1.extname)(dto.thumbnailFile.fileName)}`);
                        const img = Buffer.from(dto.thumbnailFile.data, "base64");
                        await bucketFile.save(img).then(async () => {
                            const url = await bucketFile.getSignedUrl({
                                action: "read",
                                expires: "03-09-2500",
                            });
                            model.thumbnailFile.url = url[0];
                            model.thumbnailFile = await entityManager.save(File_1.File, model.thumbnailFile);
                        });
                    }
                }
                const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: updatedByUserId,
                        active: true,
                    },
                });
                if (!updatedBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                model.updatedBy = updatedBy;
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
            try {
                const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                    where: {
                        employeeUserId: updatedByUserId,
                        active: true,
                    },
                });
                if (!updatedBy) {
                    throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
                }
                const sequenceMap = new Map(dtos.map((dto) => [dto.modelId, dto.sequenceId]));
                const models = await entityManager.find(Model_1.Model, {
                    where: {
                        modelId: (0, typeorm_2.In)(Array.from(sequenceMap.keys())),
                    },
                });
                if (models.length !== dtos.length) {
                    throw new Error("Some models specified in the request were not found.");
                }
                let tempSequence = Math.max(...models.map((cat) => parseInt(cat.sequenceId))) + 1;
                for (const model of models) {
                    model.sequenceId = (tempSequence++).toString();
                    model.lastUpdatedAt = await (0, utils_2.getDate)();
                    model.updatedBy = updatedBy;
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
            var _a, _b, _c, _d;
            let model = await entityManager.findOne(Model_1.Model, {
                where: {
                    modelId,
                    active: true,
                },
            });
            if (!model) {
                throw Error(model_constant_1.MODEL_ERROR_NOT_FOUND);
            }
            model.active = false;
            model.lastUpdatedAt = await (0, utils_2.getDate)();
            const updatedBy = await entityManager.findOne(EmployeeUsers_1.EmployeeUsers, {
                where: {
                    employeeUserId: updatedByUserId,
                    active: true,
                },
            });
            if (!updatedBy) {
                throw Error(employee_user_error_constant_1.EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
            }
            model.updatedBy = updatedBy;
            model = await entityManager.save(Model_1.Model, model);
            (_a = model === null || model === void 0 ? void 0 : model.createdBy) === null || _a === void 0 ? true : delete _a.password;
            (_b = model === null || model === void 0 ? void 0 : model.createdBy) === null || _b === void 0 ? true : delete _b.refreshToken;
            (_c = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _c === void 0 ? true : delete _c.password;
            (_d = model === null || model === void 0 ? void 0 : model.updatedBy) === null || _d === void 0 ? true : delete _d.refreshToken;
            return model;
        });
    }
};
ModelService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(Model_1.Model)),
    __metadata("design:paramtypes", [firebase_provider_1.FirebaseProvider,
        typeorm_2.Repository])
], ModelService);
exports.ModelService = ModelService;
//# sourceMappingURL=model.service.js.map