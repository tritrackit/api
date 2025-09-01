import { Locations } from "src/db/entities/Locations";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { SCANNER_ERROR_NOT_FOUND } from "src/common/constant/scanner.constant";
import { CONST_QUERYCURRENT_TIMESTAMP } from "src/common/constant/timestamp.constant";
import { EMPLOYEE_USER_ERROR_USER_NOT_FOUND } from "src/common/constant/employee-user-error.constant";
import {
  columnDefToTypeORMCondition,
  generateIndentityCode,
  getDate,
} from "src/common/utils/utils";
import { CreateScannerDto } from "src/core/dto/scanner/scanner.create.dto";
import { UpdateScannerDto } from "src/core/dto/scanner/scanner.update.dto";
import { Scanner } from "src/db/entities/Scanner";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Repository } from "typeorm";
import { LOCATIONS_ERROR_NOT_FOUND } from "src/common/constant/locations.constant";
import { Status } from "src/db/entities/Status";
import { CacheService } from "./cache.service";
import { CacheKeys } from "src/common/constant/cache.constant";

@Injectable()
export class ScannerService {
  constructor(
    @InjectRepository(Scanner)
    private readonly scannerRepo: Repository<Scanner>,
    private readonly cacheService: CacheService
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const key = CacheKeys.scanner.list(
      pageIndex,
      pageSize,
      JSON.stringify(order),
      JSON.stringify(columnDef)
    );
    const cached = this.cacheService.get<{ results: Scanner[]; total: number }>(
      key
    );
    if (cached) return cached;

    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.scannerRepo.find({
        where: {
          ...condition,
          active: true,
        },
        relations: {
          createdBy: true,
          updatedBy: true,
          status: true,
          location: true,
          assignedEmployeeUser: true,
        },
        skip,
        take,
        order,
      }),
      this.scannerRepo.count({
        where: {
          ...condition,
          active: true,
        },
      }),
    ]);
    const response = {
      results: results.map((x) => {
        delete x?.assignedEmployeeUser?.password;
        delete x?.assignedEmployeeUser?.refreshToken;
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

  async getById(scannerId) {
    const key = CacheKeys.scanner.byId(scannerId);
    const cached = this.cacheService.get<Scanner>(key);
    if (cached) return cached;

    const result = await this.scannerRepo.findOne({
      where: {
        scannerId,
        active: true,
      },
      relations: {
        createdBy: true,
        updatedBy: true,
        assignedEmployeeUser: true,
        location: true,
        status: true,
      },
    });
    if (!result) {
      throw Error(SCANNER_ERROR_NOT_FOUND);
    }
    delete result?.assignedEmployeeUser?.password;
    delete result?.assignedEmployeeUser?.refreshToken;
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    this.cacheService.set(key, result);
    return result;
  }

  async getByCode(scannerCode) {
    const key = CacheKeys.scanner.byCode(scannerCode);
    const cached = this.cacheService.get<Scanner>(key);
    if (cached) return cached;
    const result = await this.scannerRepo.findOne({
      where: {
        scannerCode,
        active: true,
      },
      relations: {
        createdBy: true,
        updatedBy: true,
        assignedEmployeeUser: true,
        location: true,
        status: true,
      },
    });
    if (!result) {
      throw Error(SCANNER_ERROR_NOT_FOUND);
    }
    delete result?.assignedEmployeeUser?.password;
    delete result?.assignedEmployeeUser?.refreshToken;
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    this.cacheService.set(key, result);
    return result;
  }

  async create(dto: CreateScannerDto, createdByUserId: string) {
    try {
      return await this.scannerRepo.manager.transaction(
        async (entityManager) => {
          let scanner = new Scanner();
          scanner.scannerCode = dto.scannerCode;
          scanner.name = dto.name;
          scanner.dateCreated = await getDate();

          const statusKey = CacheKeys.status.byId(dto.statusId);
          let status = this.cacheService.get<Status>(statusKey);
          if (!status) {
            status = await entityManager.findOne(Status, {
              where: {
                statusId: dto.statusId,
              },
            });
            this.cacheService.set(statusKey, status);
          }
          if (!status) {
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }
          scanner.status = status;

          const locationKey = CacheKeys.locations.byId(dto.locationId);
          let location = this.cacheService.get<Locations>(locationKey);
          if (!location) {
            location = await entityManager.findOne(Locations, {
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
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }
          scanner.location = location;

          const assignedEmployeeUserKey = CacheKeys.employeeUsers.byId(
            dto.assignedEmployeeUserId
          );
          let assignedEmployeeUser = this.cacheService.get<EmployeeUsers>(
            assignedEmployeeUserKey
          );
          if (!assignedEmployeeUser) {
            assignedEmployeeUser = await entityManager.findOne(EmployeeUsers, {
              where: {
                employeeUserId: dto.assignedEmployeeUserId,
                active: true,
              },
              relations: {
                role: true,
                createdBy: true,
                updatedBy: true,
                pictureFile: true,
              },
            });
            this.cacheService.set(
              assignedEmployeeUserKey,
              assignedEmployeeUser
            );
          }
          if (!assignedEmployeeUser) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          scanner.assignedEmployeeUser = {
            ...assignedEmployeeUser,
          };

          delete scanner.assignedEmployeeUser.createdBy;
          delete scanner.assignedEmployeeUser.updatedBy;

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
          scanner.createdBy = {
            ...createdBy,
          };
          delete scanner.createdBy.createdBy;
          delete scanner.createdBy.updatedBy;
          scanner = await entityManager.save(Scanner, scanner);
          delete scanner?.assignedEmployeeUser?.password;
          delete scanner?.assignedEmployeeUser?.refreshToken;
          delete scanner?.createdBy?.password;
          delete scanner?.createdBy?.refreshToken;
          delete scanner?.updatedBy?.password;
          delete scanner?.updatedBy?.refreshToken;
          // Invalidate caches
          this.cacheService.delByPrefix(CacheKeys.scanner.prefix);
          return scanner;
        }
      );
    } catch (ex) {
      if (
        ex["message"] &&
        (ex["message"].toLowerCase().includes("duplicate key") ||
          ex["message"].toLowerCase().includes("violates unique constraint")) &&
        ex["message"].includes("Name")
      ) {
        throw Error("Name already exists!");
      } else if (
        ex["message"] &&
        (ex["message"].toLowerCase().includes("duplicate key") ||
          ex["message"].toLowerCase().includes("violates unique constraint")) &&
        ex["message"].toLowerCase().includes("scannercode")
      ) {
        throw Error("Scanner code already exists!");
      } else {
        throw ex;
      }
    }
  }

  async update(scannerId, dto: UpdateScannerDto, updatedByUserId: string) {
    try {
      return await this.scannerRepo.manager.transaction(
        async (entityManager) => {
          const scannerKey = CacheKeys.scanner.byCode(scannerId);
          let scanner = this.cacheService.get<Scanner>(scannerKey);
          if (!scanner) {
            scanner = await entityManager.findOne(Scanner, {
              where: {
                scannerId,
                active: true,
              },
              relations: {
                createdBy: true,
                updatedBy: true,
                assignedEmployeeUser: true,
                location: true,
                status: true,
              },
            });
          }
          if (!scanner) {
            throw Error(SCANNER_ERROR_NOT_FOUND);
          }
          scanner.lastUpdatedAt = await getDate();

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
          scanner.updatedBy = {
            ...updatedBy,
          };
          delete scanner.updatedBy.createdBy;
          delete scanner.updatedBy.updatedBy;

          scanner.scannerCode = dto.scannerCode;
          scanner.name = dto.name;

          const statusKey = CacheKeys.status.byId(dto.statusId);
          let status = this.cacheService.get<Status>(statusKey);
          if (!status) {
            status = await entityManager.findOne(Status, {
              where: {
                statusId: dto.statusId,
              },
            });
            this.cacheService.set(statusKey, status);
          }
          if (!status) {
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }
          scanner.status = status;

          const locationKey = CacheKeys.locations.byId(dto.locationId);
          let location = this.cacheService.get<Locations>(locationKey);
          if (!location) {
            location = await entityManager.findOne(Locations, {
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
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }
          scanner.location = location;

          const assignedEmployeeUserKey = CacheKeys.employeeUsers.byId(
            dto.assignedEmployeeUserId
          );
          let assignedEmployeeUser = this.cacheService.get<EmployeeUsers>(
            assignedEmployeeUserKey
          );
          if (!assignedEmployeeUser) {
            assignedEmployeeUser = await entityManager.findOne(EmployeeUsers, {
              where: {
                employeeUserId: dto.assignedEmployeeUserId,
                active: true,
              },
              relations: {
                role: true,
                createdBy: true,
                updatedBy: true,
                pictureFile: true,
              },
            });
            this.cacheService.set(
              assignedEmployeeUserKey,
              assignedEmployeeUser
            );
          }
          if (!assignedEmployeeUser) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          scanner.assignedEmployeeUser = {
            ...assignedEmployeeUser,
          };
          delete scanner.assignedEmployeeUser.createdBy;
          delete scanner.assignedEmployeeUser.updatedBy;

          scanner = await entityManager.save(Scanner, scanner);
          delete scanner?.assignedEmployeeUser?.password;
          delete scanner?.assignedEmployeeUser?.refreshToken;
          delete scanner?.createdBy?.password;
          delete scanner?.createdBy?.refreshToken;
          delete scanner?.updatedBy?.password;
          delete scanner?.updatedBy?.refreshToken;
          // Invalidate caches
          this.cacheService.del(CacheKeys.scanner.byId(scanner?.scannerId));
          this.cacheService.del(CacheKeys.scanner.byCode(scanner.scannerCode));
          this.cacheService.delByPrefix(CacheKeys.scanner.prefix);
          return scanner;
        }
      );
    } catch (ex) {
      if (
        ex["message"] &&
        (ex["message"].includes("duplicate key") ||
          ex["message"].includes("violates unique constraint")) &&
        ex["message"].includes("u_scanner")
      ) {
        throw Error("Entry already exists!");
      } else {
        throw ex;
      }
    }
  }

  async delete(scannerCode, updatedByUserId: string) {
    return await this.scannerRepo.manager.transaction(async (entityManager) => {
      const scannerKey = CacheKeys.scanner.byCode(scannerCode);
      let scanner = this.cacheService.get<Scanner>(scannerKey);
      if (!scanner) {
        scanner = await entityManager.findOne(Scanner, {
          where: {
            scannerCode,
            active: true,
          },
          relations: {
            createdBy: true,
            updatedBy: true,
            assignedEmployeeUser: true,
            location: true,
            status: true,
          },
        });
      }
      if (!scanner) {
        throw Error(SCANNER_ERROR_NOT_FOUND);
      }
      scanner.active = false;
      scanner.lastUpdatedAt = await getDate();

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
      scanner.updatedBy = {
        ...updatedBy,
      };
      delete scanner.updatedBy.createdBy;
      delete scanner.updatedBy.updatedBy;
      scanner = await entityManager.save(Scanner, scanner);
      delete scanner?.assignedEmployeeUser?.password;
      delete scanner?.assignedEmployeeUser?.refreshToken;
      delete scanner?.createdBy?.password;
      delete scanner?.createdBy?.refreshToken;
      delete scanner?.updatedBy?.password;
      delete scanner?.updatedBy?.refreshToken;
      // Invalidate caches
      this.cacheService.del(CacheKeys.scanner.byId(scanner?.scannerId));
      this.cacheService.del(CacheKeys.scanner.byCode(scanner.scannerCode));
      this.cacheService.delByPrefix(CacheKeys.scanner.prefix);
      return scanner;
    });
  }
}
