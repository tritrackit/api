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

@Injectable()
export class ScannerService {
  constructor(
    @InjectRepository(Scanner)
    private readonly scannerRepo: Repository<Scanner>
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
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

  async getById(scannerId) {
    const result = await this.scannerRepo.findOne({
      where: {
        scannerId,
        active: true,
      },
      relations: {
        createdBy: true,
        updatedBy: true,
      },
    });
    if (!result) {
      throw Error(SCANNER_ERROR_NOT_FOUND);
    }
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
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

          const status = await entityManager.findOne(Status, {
            where: {
              statusId: dto.statusId,
            },
          });
          if (!status) {
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }
          scanner.status = status;

          const location = await entityManager.findOne(Locations, {
            where: {
              locationId: dto.locationId,
              active: true,
            },
          });
          if (!location) {
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }
          scanner.location = location;

          const assignedEmployeeUser = await entityManager.findOne(
            EmployeeUsers,
            {
              where: {
                employeeUserId: dto.assignedEmployeeUserId,
                active: true,
              },
            }
          );
          if (!assignedEmployeeUser) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          scanner.assignedEmployeeUser = assignedEmployeeUser;

          const createdBy = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId: createdByUserId,
              active: true,
            },
          });
          if (!createdBy) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          scanner.createdBy = createdBy;
          scanner = await entityManager.save(Scanner, scanner);
          delete scanner?.createdBy?.password;
          delete scanner?.createdBy?.refreshToken;
          delete scanner?.updatedBy?.password;
          delete scanner?.updatedBy?.refreshToken;
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

  async update(scannerCode, dto: UpdateScannerDto, updatedByUserId: string) {
    try {
      return await this.scannerRepo.manager.transaction(
        async (entityManager) => {
          let scanner = await entityManager.findOne(Scanner, {
            where: {
              scannerCode,
              active: true,
            },
          });
          if (!scanner) {
            throw Error(SCANNER_ERROR_NOT_FOUND);
          }
          scanner.lastUpdatedAt = await getDate();

          const updatedBy = await entityManager.findOne(EmployeeUsers, {
            where: {
              employeeUserId: updatedByUserId,
              active: true,
            },
          });
          if (!updatedBy) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          scanner.updatedBy = updatedBy;

          scanner.scannerCode = dto.scannerCode;
          scanner.name = dto.name;

          const location = await entityManager.findOne(Locations, {
            where: {
              locationId: dto.locationId,
              active: true,
            },
          });
          if (!location) {
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }
          scanner.location = location;

          const assignedEmployeeUser = await entityManager.findOne(
            EmployeeUsers,
            {
              where: {
                employeeUserId: dto.assignedEmployeeUserId,
                active: true,
              },
            }
          );
          if (!assignedEmployeeUser) {
            throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
          }
          scanner.assignedEmployeeUser = assignedEmployeeUser;

          scanner = await entityManager.save(Scanner, scanner);
          delete scanner?.createdBy?.password;
          delete scanner?.createdBy?.refreshToken;
          delete scanner?.updatedBy?.password;
          delete scanner?.updatedBy?.refreshToken;
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
      let scanner = await entityManager.findOne(Scanner, {
        where: {
          scannerCode,
          active: true,
        },
      });
      if (!scanner) {
        throw Error(SCANNER_ERROR_NOT_FOUND);
      }
      scanner.active = false;
      scanner.lastUpdatedAt = await getDate();

      const updatedBy = await entityManager.findOne(EmployeeUsers, {
        where: {
          employeeUserId: updatedByUserId,
          active: true,
        },
      });
      if (!updatedBy) {
        throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
      }
      scanner.updatedBy = updatedBy;
      scanner = await entityManager.save(Scanner, scanner);
      delete scanner?.createdBy?.password;
      delete scanner?.createdBy?.refreshToken;
      delete scanner?.updatedBy?.password;
      delete scanner?.updatedBy?.refreshToken;
      return scanner;
    });
  }
}
