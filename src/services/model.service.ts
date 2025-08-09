import { Injectable } from "@nestjs/common";
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

@Injectable()
export class ModelService {
  constructor(
    private firebaseProvider: FirebaseProvider,
    @InjectRepository(Model)
    private readonly modelRepo: Repository<Model>
  ) {}

  async getPagination({ pageSize, pageIndex, order, keywords }) {
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
            LEFT JOIN dbo."Unit" p ON c."ModelId" = p."ModelId"
            WHERE p."Active" = true AND c."ModelId" IN(${modelIds.join(",")})
            GROUP BY c."ModelId"`)
              : [];
          return queryRes as { modelId: string; count: number }[];
        }),
    ]);

    return {
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
  }

  async getById(modelId) {
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
      throw Error(MODEL_ERROR_NOT_FOUND);
    }
    const unitCount = await this.modelRepo.manager.count(Units, {
      where: {
        model: {
          modelId,
        },
      },
    });
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    return {
      ...result,
      unitCount,
    };
  }

  async create(dto: CreateModelDto, createdByUserId: string) {
    return await this.modelRepo.manager.transaction(async (entityManager) => {
      try {
        let model = new Model();
        model.modelName = dto.modelName;
        model.description = dto.description;
        model.sequenceId = dto.sequenceId;
        model.dateCreated = await getDate();
        const createdBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: createdByUserId,
            active: true,
          },
        });
        if (!createdBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        model.createdBy = createdBy;

        model = await entityManager.save(Model, model);

        if (dto.thumbnailFile) {
          const bucket = this.firebaseProvider.app.storage().bucket();
          model.thumbnailFile = new File();
          const newGUID: string = uuid();
          const bucketFile = bucket.file(
            `model/${newGUID}${extname(dto.thumbnailFile.fileName)}`
          );
          const img = Buffer.from(dto.thumbnailFile.data, "base64");
          await bucketFile.save(img).then(async () => {
            const url = await bucketFile.getSignedUrl({
              action: "read",
              expires: "03-09-2500",
            });
            model.thumbnailFile.guid = newGUID;
            model.thumbnailFile.fileName = dto.thumbnailFile.fileName;
            model.thumbnailFile.url = url[0];
            model.thumbnailFile = await entityManager.save(
              File,
              model.thumbnailFile
            );
          });
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
        let model = await entityManager.findOne(Model, {
          where: {
            modelId,
            active: true,
          },
          relations: {
            thumbnailFile: true,
          },
        });
        if (!model) {
          throw Error(MODEL_ERROR_NOT_FOUND);
        }
        model.modelName = dto.modelName;
        model.description = dto.description;
        model.sequenceId = dto.sequenceId;
        model.lastUpdatedAt = await getDate();
        if (dto.thumbnailFile) {
          const newGUID: string = uuid();
          const bucket = this.firebaseProvider.app.storage().bucket();
          if (model.thumbnailFile) {
            try {
              const deleteFile = bucket.file(
                `model/${model.thumbnailFile.guid}${extname(
                  model.thumbnailFile.fileName
                )}`
              );
              const exists = await deleteFile.exists();
              if (exists[0]) {
                deleteFile.delete();
              }
            } catch (ex) {
              console.log(ex);
            }
            const file = model.thumbnailFile;
            file.guid = newGUID;
            file.fileName = dto.thumbnailFile.fileName;

            const bucketFile = bucket.file(
              `model/${newGUID}${extname(dto.thumbnailFile.fileName)}`
            );
            const img = Buffer.from(dto.thumbnailFile.data, "base64");
            await bucketFile.save(img).then(async (res) => {
              console.log("res");
              console.log(res);
              const url = await bucketFile.getSignedUrl({
                action: "read",
                expires: "03-09-2500",
              });

              file.url = url[0];
              model.thumbnailFile = await entityManager.save(File, file);
            });
          } else {
            model.thumbnailFile = new File();
            model.thumbnailFile.guid = newGUID;
            model.thumbnailFile.fileName = dto.thumbnailFile.fileName;
            const bucketFile = bucket.file(
              `model/${newGUID}${extname(dto.thumbnailFile.fileName)}`
            );
            const img = Buffer.from(dto.thumbnailFile.data, "base64");
            await bucketFile.save(img).then(async () => {
              const url = await bucketFile.getSignedUrl({
                action: "read",
                expires: "03-09-2500",
              });
              model.thumbnailFile.url = url[0];
              model.thumbnailFile = await entityManager.save(
                File,
                model.thumbnailFile
              );
            });
          }
        }
        const updatedBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: updatedByUserId,
            active: true,
          },
        });
        if (!updatedBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        model.updatedBy = updatedBy;
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
        const updatedBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: updatedByUserId,
            active: true,
          },
        });
        if (!updatedBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        // Map models by their IDs to their new sequence values
        const sequenceMap = new Map(
          dtos.map((dto) => [dto.modelId, dto.sequenceId]) // No need to parse, SequenceId is a string
        );

        // Retrieve all models involved in the update
        const models = await entityManager.find(Model, {
          where: {
            modelId: In(Array.from(sequenceMap.keys())),
          },
        });

        // Ensure all models are found
        if (models.length !== dtos.length) {
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
          model.updatedBy = updatedBy;
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
        return models.map((x: Model) => {
          delete x?.createdBy?.password;
          delete x?.createdBy?.refreshToken;
          delete x?.updatedBy?.password;
          delete x?.updatedBy?.refreshToken;
          return x;
        }); // Return the updated models
      } catch (ex) {
        console.error("Error updating order:", ex);
        throw ex;
      }
    });
  }

  async delete(modelId: string, updatedByUserId: string) {
    return await this.modelRepo.manager.transaction(async (entityManager) => {
      let model = await entityManager.findOne(Model, {
        where: {
          modelId,
          active: true,
        },
      });
      if (!model) {
        throw Error(MODEL_ERROR_NOT_FOUND);
      }
      model.active = false;
      model.lastUpdatedAt = await getDate();
      const updatedBy = await entityManager.findOne(EmployeeUsers, {
        where: {
          employeeUserId: updatedByUserId,
          active: true,
        },
      });
      if (!updatedBy) {
        throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
      }
      model.updatedBy = updatedBy;
      model = await entityManager.save(Model, model);
      delete model?.createdBy?.password;
      delete model?.createdBy?.refreshToken;
      delete model?.updatedBy?.password;
      delete model?.updatedBy?.refreshToken;
      return model;
    });
  }
}
