import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { extname } from "path";
import {
  MODEL_ERROR_NOT_FOUND,
  MODEL_ERROR_DUPLICATE,
} from "src/common/constant/model.constant";
import { toCamelCase } from "src/common/utils/utils";
import { CreateModelDto } from "src/core/dto/model/model.create.dto";
import { UpdateModelDto } from "src/core/dto/model/model.update.dto";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { Model } from "src/db/entities/Model";
import { Units } from "src/db/entities/Units";
import { Brackets, In, Repository } from "typeorm";
import { File } from "src/db/entities/File";
import { UpdateModelOrderDto } from "src/core/dto/model/model.update-order.dto";
import { v4 as uuid } from "uuid";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { EMPLOYEE_USER_ERROR_USER_NOT_FOUND } from "src/common/constant/employee-user-error.constant";
import { getDate } from "src/common/utils/utils";
import { CloudinaryService } from "./cloudinary.service";
import { CacheKeys } from "src/common/constant/cache.constant";
import { CacheService } from "./cache.service";

@Injectable()
export class ModelService {
  private readonly logger = new Logger(ModelService.name);

  constructor(
    private firebaseProvider: FirebaseProvider,
    @InjectRepository(Model)
    private readonly modelRepo: Repository<Model>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cacheService: CacheService
  ) {}

  async getPagination({ pageSize, pageIndex, order, keywords }) {
    const key = CacheKeys.model.list(
      pageIndex,
      pageSize,
      JSON.stringify(order),
      JSON.stringify(keywords)
    );
    const cached = this.cacheService.get<{ results: Model[]; total: number }>(
      key
    );
    if (cached) return cached;

    let skip = 0;
    let take = Number(pageSize);

    if (Number(pageIndex) > 0) {
      skip = Number(pageIndex) * Number(pageSize);
    } else if (Number(pageIndex) === 0) {
      // Show all records if pageIndex is 0
      skip = 0;
      take = undefined;
    }

    keywords = keywords ? keywords : "";

    let field = "model.sequenceId";
    let direction: "ASC" | "DESC" = "ASC";

    if (order) {
      const [rawField, rawDirection] = Object.entries(order)[0];
      field = `model.${toCamelCase(rawField)}`;
      const upperDir = String(rawDirection).toUpperCase();
      direction = upperDir === "ASC" ? "ASC" : "DESC";
    }

    const [results, total, models] = await Promise.all([
      this.modelRepo
        .createQueryBuilder("model")
        .leftJoinAndSelect("model.thumbnailFile", "thumbnailFile")
        .where(`model."Active" = true`)
        .andWhere(
          new Brackets((qb) => {
            qb.where(`model."ModelName" ILIKE :keywords`, {
              keywords: `%${keywords}%`,
            }).orWhere(`model."Description" ILIKE :keywords`, {
              keywords: `%${keywords}%`,
            });
          })
        )
        .orderBy(field, direction)
        .skip(skip)
        .take(take)
        .getMany(),
      this.modelRepo
        .createQueryBuilder("model")
        .where(`model."Active" = true`)
        .andWhere(
          new Brackets((qb) => {
            qb.where(`model."ModelName" ILIKE :keywords`, {
              keywords: `%${keywords}%`,
            }).orWhere(`model."Description" ILIKE :keywords`, {
              keywords: `%${keywords}%`,
            });
          })
        )
        .getCount(),
      this.modelRepo
        .createQueryBuilder("model")
        .where(`model."Active" = true`)
        .andWhere(
          new Brackets((qb) => {
            qb.where(`model."ModelName" ILIKE :keywords`, {
              keywords: `%${keywords}%`,
            }).orWhere(`model."Description" ILIKE :keywords`, {
              keywords: `%${keywords}%`,
            });
          })
        )
        .getMany()
        .then(async (res) => {
          const modelIds = res.map((x) => x.modelId);
          // return collectionIds;
          const queryRes =
            modelIds.length > 0
              ? await this.modelRepo.query(`
            SELECT c."ModelId" as "modelId",
            COUNT(p."UnitId")
            FROM dbo."Model" c
            LEFT JOIN dbo."Units" p ON c."ModelId" = p."ModelId"
            WHERE p."Active" = true AND c."ModelId" IN(${modelIds.join(",")})
            GROUP BY c."ModelId"`)
              : [];
          return queryRes as { modelId: string; count: number }[];
        }),
    ]);

    const response = {
      results: results.map((x) => {
        x["unitCount"] = models.some(
          (pc) => x.modelId.toString() === pc.modelId.toString()
        )
          ? models.find((pc) => x.modelId.toString() === pc.modelId.toString())
              .count
          : 0;
        delete x?.createdBy?.password;
        delete x?.createdBy?.refreshToken;
        delete x?.updatedBy?.password;
        delete x?.updatedBy?.refreshToken;
        return x;
      }) as any[],
      total,
    };
    this.cacheService.set(key, response);
    return response;
  }

  async getById(modelId: string) {
    const key = CacheKeys.model.byId(modelId);
    const cached = this.cacheService.get<Model>(key);
    if (cached) return cached;

    // Run both queries at the same time
    const [result, unitCount] = await Promise.all([
      this.modelRepo.findOne({
        where: { modelId, active: true },
        relations: { thumbnailFile: true },
      }),
      this.modelRepo.manager.count(Units, {
        where: { model: { modelId } },
      }),
    ]);

    if (!result) {
      // (Optional) if you want to avoid repeated DB hits for missing models,
      // you could cache null with a short TTL and change the read to `if (cached !== undefined) return cached;`
      throw Error(MODEL_ERROR_NOT_FOUND);
    }

    (result as any).unitCount = unitCount;

    // scrub secrets
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;

    this.cacheService.set(key, result); // optional: add TTL { ttlSeconds: 60 }
    return result;
  }

  async create(dto: CreateModelDto, createdByUserId: string) {
    return await this.modelRepo.manager.transaction(async (entityManager) => {
      try {
        let model = new Model();
        model.modelName = dto.modelName;
        model.description = dto.description;
        model.sequenceId = dto.sequenceId;
        model.dateCreated = await getDate();

        const createdByKey = CacheKeys.employeeUsers.byId(createdByUserId);
        let createdBy = this.cacheService.get<EmployeeUsers>(createdByKey);
        if (!createdBy) {
          createdBy = await entityManager.findOne(EmployeeUsers, {
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
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        model.createdBy = createdBy;

        model.createdBy = {
          ...createdBy,
        };
        delete model.createdBy.createdBy;
        delete model.createdBy.updatedBy;
        model = await entityManager.save(Model, model);
        let uploaded: File | undefined;
        if (dto.thumbnailFile) {
          uploaded = await this.cloudinaryService.uploadDataUri(
            dto.thumbnailFile.data,
            dto.thumbnailFile.fileName,
            "model"
          );
        }
        if (uploaded) {
          model.thumbnailFile = await entityManager.save(File, uploaded);
        }
        model = await entityManager.save(Model, model);
        model = await entityManager.findOne(Model, {
          where: {
            modelId: model?.modelId,
          },
          relations: {
            thumbnailFile: true,
          },
        });
        delete model?.createdBy?.password;
        delete model?.createdBy?.refreshToken;
        delete model?.updatedBy?.password;
        delete model?.updatedBy?.refreshToken;
        // Invalidate caches
        this.cacheService.delByPrefix(CacheKeys.model.prefix);
        return model;
      } catch (ex) {
        if (
          ex.message.toLowerCase().includes("duplicate") &&
          ex.message.toLowerCase().includes("sequenceid")
        ) {
          throw Error("Sequence already exist");
        } else if (
          ex.message.toLowerCase().includes("duplicate") &&
          ex.message.toLowerCase().includes("name")
        ) {
          throw Error(MODEL_ERROR_DUPLICATE);
        } else {
          throw ex;
        }
      }
    });
  }

  async update(modelId, dto: UpdateModelDto, updatedByUserId: string) {
    return await this.modelRepo.manager.transaction(async (entityManager) => {
      try {
        const key = CacheKeys.model.byId(modelId);
        let model = this.cacheService.get<Model>(key);
        if (!model) {
          model = await entityManager.findOne(Model, {
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
          throw Error(MODEL_ERROR_NOT_FOUND);
        }
        model.modelName = dto.modelName;
        model.description = dto.description;
        model.sequenceId = dto.sequenceId;
        model.lastUpdatedAt = await getDate();
        let uploaded: File | undefined;
        if (dto.thumbnailFile) {
          if (model.thumbnailFile) {
            try {
              await this.cloudinaryService.deleteByPublicId(
                model.thumbnailFile?.publicId
              );
            } catch (ex) {
              this.logger.warn(`Failed to delete old thumbnail file: ${ex.message}`, ex.stack);
            }
          }
          uploaded = await this.cloudinaryService.uploadDataUri(
            dto.thumbnailFile.data,
            dto.thumbnailFile.fileName,
            "model"
          );
        }
        if (uploaded) {
          uploaded.fileId = model.thumbnailFile?.fileId;
          model.thumbnailFile = await entityManager.save(File, uploaded);
        }
        const updatedByKey = CacheKeys.employeeUsers.byId(updatedByUserId);
        let updatedBy = this.cacheService.get<EmployeeUsers>(updatedByKey);
        if (!updatedBy) {
          updatedBy = await entityManager.findOne(EmployeeUsers, {
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
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        model.updatedBy = updatedBy;
        model.updatedBy = {
          ...updatedBy,
        };
        delete model?.updatedBy?.createdBy;
        delete model?.updatedBy?.updatedBy;
        model = await entityManager.save(Model, model);
        model = await entityManager.findOne(Model, {
          where: {
            modelId: model?.modelId,
          },
          relations: {
            thumbnailFile: true,
          },
        });
        delete model?.createdBy?.password;
        delete model?.createdBy?.refreshToken;
        delete model?.updatedBy?.password;
        delete model?.updatedBy?.refreshToken;
        // Invalidate caches
        this.cacheService.del(CacheKeys.model.byId(model?.modelId));
        this.cacheService.delByPrefix(CacheKeys.model.prefix);
        return model;
      } catch (ex) {
        if (ex.message.includes("duplicate")) {
          throw Error(MODEL_ERROR_DUPLICATE);
        } else {
          throw ex;
        }
      }
    });
  }

  async updateOrder(dtos: UpdateModelOrderDto[], updatedByUserId: string) {
    return await this.modelRepo.manager.transaction(async (entityManager) => {
      try {
        const updatedByKey = CacheKeys.employeeUsers.byId(updatedByUserId);
        let updatedBy = this.cacheService.get<EmployeeUsers>(updatedByKey);
        if (!updatedBy) {
          updatedBy = await entityManager.findOne(EmployeeUsers, {
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
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        // Map models by their IDs to their new sequence values
        const sequenceMap = new Map(
          dtos.map((dto) => [dto.modelId, dto.sequenceId]) // No need to parse, SequenceId is a string
        );

        // Retrieve all models involved in the update
        // Retrieve all models involved in the update (cache-first, DB for misses)
        const ids = Array.from(sequenceMap.keys());
        const modelsById = new Map<string, Model>();
        const dbMisses: string[] = [];

        for (const id of ids) {
          const ck = CacheKeys.model.byId
            ? CacheKeys.model.byId(id as any) // if you already have byId
            : `model:id:${id}`; // fallback if you only had .prefix
          const cached = this.cacheService.get<Model>(ck);

          if (cached) {
            // avoid mutating cached reference (since useClones=false), shallow copy is enough
            modelsById.set(String(id), { ...(cached as any) });
          } else {
            dbMisses.push(String(id));
          }
        }

        if (dbMisses.length) {
          const fetched = await entityManager.find(Model, {
            where: { modelId: In(dbMisses) },
          });

          // put into map (and warm cache)
          for (const m of fetched) {
            const mId = String((m as any).modelId);
            modelsById.set(mId, m);

            const ck = CacheKeys.model.byId
              ? CacheKeys.model.byId(mId as any)
              : `model:id:${mId}`;
            this.cacheService.set<Model>(ck, m); // optional: add { ttlSeconds: 60 }
          }
        }

        // Build the final array in the same id order and validate
        const models = ids
          .map((id) => modelsById.get(String(id)))
          .filter((m): m is Model => !!m);

        if (models.length !== ids.length) {
          throw new Error(
            "Some models specified in the request were not found."
          );
        }
        // Temporary sequence to avoid index conflicts
        let tempSequence =
          Math.max(...models.map((cat) => parseInt(cat.sequenceId))) + 1;

        // Assign temporary sequence IDs
        for (const model of models) {
          model.sequenceId = (tempSequence++).toString();
          model.lastUpdatedAt = await getDate();
          model.updatedBy = {
            ...updatedBy,
          };

          delete model?.updatedBy?.createdBy;
          delete model?.updatedBy?.updatedBy;
        }
        await entityManager.save(models);

        // Assign final sequence IDs
        for (const model of models) {
          const newSequence = sequenceMap.get(model.modelId);
          if (newSequence !== undefined) {
            model.sequenceId = newSequence;
          }
          model.lastUpdatedAt = await getDate();
          model.updatedBy = updatedBy;
        }

        // Save all updates
        await entityManager.save(models);
        this.cacheService.delByPrefix(CacheKeys.model.prefix);
        return models.map((x: Model) => {
          delete x?.createdBy?.password;
          delete x?.createdBy?.refreshToken;
          delete x?.updatedBy?.password;
          delete x?.updatedBy?.refreshToken;
          return x;
        });
        // Invalidate caches
      } catch (ex) {
        this.logger.error(`Error updating order: ${ex.message}`, ex.stack);
        throw ex;
      }
    });
  }

  async delete(modelId: string, updatedByUserId: string) {
    return await this.modelRepo.manager.transaction(async (entityManager) => {
      const key = CacheKeys.model.byId(modelId);
      let model = this.cacheService.get<Model>(key);
      if (!model) {
        model = await entityManager.findOne(Model, {
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
        throw Error(MODEL_ERROR_NOT_FOUND);
      }
      model.active = false;
      model.lastUpdatedAt = await getDate();
      const updatedByKey = CacheKeys.employeeUsers.byId(updatedByUserId);
      let updatedBy = this.cacheService.get<EmployeeUsers>(updatedByKey);
      if (!updatedBy) {
        updatedBy = await entityManager.findOne(EmployeeUsers, {
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
        throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
      }
      model.updatedBy = {
        ...updatedBy,
      };
      delete model?.updatedBy?.createdBy;
      delete model?.updatedBy?.updatedBy;
      if (model.thumbnailFile) {
        try {
          await this.cloudinaryService.deleteByPublicId(
            model.thumbnailFile?.publicId
          );
        } catch (ex) {
          this.logger.warn(`Failed to delete thumbnail file: ${ex.message}`, ex.stack);
        }
      }
      model = await entityManager.save(Model, model);
      delete model?.createdBy?.password;
      delete model?.createdBy?.refreshToken;
      delete model?.updatedBy?.password;
      delete model?.updatedBy?.refreshToken;
      // Invalidate caches
      this.cacheService.del(CacheKeys.model.byId(model?.modelId));
      this.cacheService.delByPrefix(CacheKeys.model.prefix);
      return model;
    });
  }
}
