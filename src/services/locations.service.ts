import { Locations } from "src/db/entities/Locations";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LOCATIONS_ERROR_NOT_FOUND } from "src/common/constant/locations.constant";
import { CONST_QUERYCURRENT_TIMESTAMP } from "src/common/constant/timestamp.constant";
import { EMPLOYEE_USER_ERROR_USER_NOT_FOUND } from "src/common/constant/employee-user-error.constant";
import {
  columnDefToTypeORMCondition,
  generateIndentityCode,
  getDate,
} from "src/common/utils/utils";
import { CreateLocationsDto } from "src/core/dto/locations/locations.create.dto";
import { UpdateLocationsDto } from "src/core/dto/locations/locations.update.dto";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Repository } from "typeorm";
import { Status } from "src/db/entities/Status";
import { CacheKeys } from "src/common/constant/cache.constant";
import { CacheService } from "./cache.service";

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Locations)
    private readonly locationsRepo: Repository<Locations>,
    private readonly cacheService: CacheService
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const key = CacheKeys.locations.list(
      pageIndex,
      pageSize,
      JSON.stringify(order),
      JSON.stringify(columnDef)
    );
    const cached = this.cacheService.get<{
      results: Locations[];
      total: number;
    }>(key);
    if (cached) return cached;

    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.locationsRepo.find({
        where: {
          ...condition,
          active: true,
        },
        relations: {
          createdBy: true,
          updatedBy: true,
        },
        skip,
        take,
        order,
      }),
      this.locationsRepo.count({
        where: {
          ...condition,
          active: true,
        },
      }),
    ]);
    const response = {
      results: results.map((x) => {
        delete x?.createdBy?.password;
        delete x?.createdBy?.refreshToken;
        delete x?.updatedBy?.password;
        delete x?.updatedBy?.refreshToken;
        return x;
      }),
      total,
    };
    this.cacheService.set(key, response);
    return response;
  }

  async getById(locationId) {
    const key = CacheKeys.locations.byId(locationId);
    const cached = this.cacheService.get<Locations>(key);
    if (cached) return cached;

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
      throw Error(LOCATIONS_ERROR_NOT_FOUND);
    }
    delete result.createdBy.password;
    if (result?.updatedBy?.password) {
      delete result.updatedBy.password;
    }
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    this.cacheService.set(key, result);
    return result;
  }

  async create(dto: CreateLocationsDto, createdByUserId: string) {
    try {
      return await this.locationsRepo.manager.transaction(
        async (entityManager) => {
          let locations = new Locations();
          locations.locationCode = dto.locationCode;
          locations.name = dto.name;
          locations.dateCreated = await getDate();

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
          locations.createdBy = createdBy;
          locations = await entityManager.save(Locations, locations);
          delete locations?.createdBy?.password;
          delete locations?.createdBy?.refreshToken;
          delete locations?.updatedBy?.password;
          delete locations?.updatedBy?.refreshToken;
          // Invalidate caches
          this.cacheService.delByPrefix(CacheKeys.locations.prefix);
          return locations;
        }
      );
    } catch (ex) {
      if (
        ex["message"] &&
        (ex["message"].includes("duplicate key") ||
          ex["message"].includes("violates unique constraint")) &&
        ex["message"].includes("u_locations")
      ) {
        throw Error("Entry already exists!");
      } else {
        throw ex;
      }
    }
  }

  async update(locationId, dto: UpdateLocationsDto, updatedByUserId: string) {
    try {
      return await this.locationsRepo.manager.transaction(
        async (entityManager) => {
          const locationKey = CacheKeys.locations.byId(locationId);
          let location = this.cacheService.get<Locations>(locationKey);
          if (!location) {
            location = await entityManager.findOne(Locations, {
              where: {
                locationId,
                active: true,
              },
              relations: {
                createdBy: true,
                updatedBy: true,
              },
            });
          }

          if (!location) {
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }

          location.locationCode = dto.locationCode;
          location.name = dto.name;
          location.lastUpdatedAt = await getDate();
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
          location.updatedBy = updatedBy;

          location = await entityManager.save(Locations, location);
          delete location?.createdBy?.password;
          delete location?.updatedBy?.password;
          delete location?.createdBy?.refreshToken;
          delete location?.updatedBy?.refreshToken;
          // Invalidate caches
          this.cacheService.del(CacheKeys.locations.byId(location?.locationId));
          this.cacheService.delByPrefix(CacheKeys.locations.prefix);
          return location;
        }
      );
    } catch (ex) {
      if (
        ex["message"] &&
        (ex["message"].includes("duplicate key") ||
          ex["message"].includes("violates unique constraint")) &&
        ex["message"].includes("u_locations")
      ) {
        throw Error("Entry already exists!");
      } else {
        throw ex;
      }
    }
  }

  async delete(locationId, updatedByUserId: string) {
    return await this.locationsRepo.manager.transaction(
      async (entityManager) => {
        const locationKey = CacheKeys.locations.byId(locationId);
        let location = this.cacheService.get<Locations>(locationKey);
        if (!location) {
          location = await entityManager.findOne(Locations, {
            where: {
              locationId,
              active: true,
            },
            relations: {
              createdBy: true,
              updatedBy: true,
            },
          });
        }
        if (!location) {
          throw Error(LOCATIONS_ERROR_NOT_FOUND);
        }
        location.active = false;
        location.lastUpdatedAt = await getDate();

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
        location.updatedBy = updatedBy;
        // Invalidate caches
        this.cacheService.del(CacheKeys.locations.byId(location?.locationId));
        this.cacheService.delByPrefix(CacheKeys.locations.prefix);
        return await entityManager.save(Locations, location);
      }
    );
  }
}
