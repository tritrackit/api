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

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Locations)
    private readonly locationsRepo: Repository<Locations>
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
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
    return {
      results: results.map((x) => {
        delete x?.createdBy?.password;
        delete x?.createdBy?.refreshToken;
        delete x?.updatedBy?.password;
        delete x?.updatedBy?.refreshToken;
        return x;
      }),
      total,
    };
  }

  async getById(locationId) {
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

          const createdBy = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId: createdByUserId,
              active: true,
            },
          });
          if (!createdBy) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          locations.createdBy = createdBy;
          locations = await entityManager.save(Locations, locations);
          delete locations?.createdBy?.password;
          delete locations?.createdBy?.refreshToken;
          delete locations?.updatedBy?.password;
          delete locations?.updatedBy?.refreshToken;
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
          let locations = await entityManager.findOne(Locations, {
            where: {
              locationId,
              active: true,
            },
          });
          if (!locations) {
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }

          locations.locationCode = dto.locationCode;
          locations.name = dto.name;
          locations.lastUpdatedAt = await getDate();
          const updatedBy = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId: updatedByUserId,
              active: true,
            },
          });
          if (!updatedBy) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          locations.updatedBy = updatedBy;

          locations = await entityManager.save(Locations, locations);
          if (locations?.createdBy?.password) {
            delete locations.createdBy.password;
          }
          if (locations?.updatedBy?.password) {
            delete locations.updatedBy.password;
          }
          if (locations?.createdBy?.refreshToken) {
            delete locations.createdBy.refreshToken;
          }
          if (locations?.updatedBy?.refreshToken) {
            delete locations.updatedBy.refreshToken;
          }
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

  async delete(locationId, updatedByUserId: string) {
    return await this.locationsRepo.manager.transaction(
      async (entityManager) => {
        const locations = await entityManager.findOne(Locations, {
          where: {
            locationId,
            active: true,
          },
        });
        if (!locations) {
          throw Error(LOCATIONS_ERROR_NOT_FOUND);
        }
        locations.active = false;
        locations.lastUpdatedAt = await getDate();

        const updatedBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: updatedByUserId,
            active: true,
          },
        });
        if (!updatedBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        locations.updatedBy = updatedBy;
        return await entityManager.save(Locations, locations);
      }
    );
  }
}
