import { LogsDto } from "./../core/dto/unit/unit-logs.dto";
import { Locations } from "src/db/entities/Locations";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UNIT_ERROR_NOT_FOUND } from "src/common/constant/units.constant";
import { CONST_QUERYCURRENT_TIMESTAMP } from "src/common/constant/timestamp.constant";
import { EMPLOYEE_USER_ERROR_USER_NOT_FOUND } from "src/common/constant/employee-user-error.constant";
import {
  columnDefToTypeORMCondition,
  generateIndentityCode,
  getDate,
} from "src/common/utils/utils";
import { CreateUnitDto } from "src/core/dto/unit/unit.create.dto";
import { UpdateUnitDto } from "src/core/dto/unit/unit.update.dto";
import { Units } from "src/db/entities/Units";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Repository } from "typeorm";
import { LOCATIONS_ERROR_NOT_FOUND } from "src/common/constant/locations.constant";
import { Status } from "src/db/entities/Status";
import { STATUS } from "src/common/constant/status.constants";
import { Model } from "src/db/entities/Model";
import { MODEL_ERROR_NOT_FOUND } from "src/common/constant/model.constant";
import { Scanner } from "src/db/entities/Scanner";
import { UnitLogs } from "src/db/entities/UnitLogs";
import { PusherService } from "./pusher.service";

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Units)
    private readonly unitsRepo: Repository<Units>,
    private pusherService: PusherService
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const skip =
      Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const condition = columnDefToTypeORMCondition(columnDef);
    const [results, total] = await Promise.all([
      this.unitsRepo.find({
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
      this.unitsRepo.count({
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

  async getById(unitId) {
    const result = await this.unitsRepo.findOne({
      where: {
        unitId,
        active: true,
      },
      relations: {
        createdBy: true,
        updatedBy: true,
      },
    });
    if (!result) {
      throw Error(UNIT_ERROR_NOT_FOUND);
    }
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    return result;
  }

  async create(dto: CreateUnitDto, createdByUserId: string) {
    try {
      return await this.unitsRepo.manager.transaction(async (entityManager) => {
        let unit = new Units();
        unit.rfid = dto.rfid;
        unit.chassisNo = dto.chassisNo;
        unit.color = dto.color;
        unit.description = dto.description;
        unit.dateCreated = await getDate();

        const model = await entityManager.findOne(Model, {
          where: {
            modelId: dto.modelId,
          },
        });
        if (!model) {
          throw Error(MODEL_ERROR_NOT_FOUND);
        }
        unit.model = model;

        const status = await entityManager.findOne(Status, {
          where: {
            statusId: STATUS.REGISTERED.toString(),
          },
        });
        if (!status) {
          throw Error(LOCATIONS_ERROR_NOT_FOUND);
        }
        unit.status = status;

        const location = await entityManager.findOne(Locations, {
          where: {
            locationId: dto.locationId,
            active: true,
          },
        });
        if (!location) {
          throw Error(LOCATIONS_ERROR_NOT_FOUND);
        }
        unit.location = location;

        const createdBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: createdByUserId,
            active: true,
          },
        });
        if (!createdBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        unit.createdBy = createdBy;
        unit = await entityManager.save(Units, unit);
        unit.unitCode = `U-${generateIndentityCode(unit.unitId)}`;
        await entityManager.save(Units, unit);
        unit = await entityManager.findOne(Units, {
          where: {
            unitId: unit.unitId,
            active: true,
          },
          relations: {
            model: true,
            location: true,
            status: true,
            createdBy: true,
            updatedBy: true,
          },
        });
        delete unit?.createdBy?.password;
        delete unit?.createdBy?.refreshToken;
        delete unit?.updatedBy?.password;
        delete unit?.updatedBy?.refreshToken;
        return unit;
      });
    } catch (ex) {
      if (
        ex["message"] &&
        (ex["message"].includes("duplicate key") ||
          ex["message"].includes("violates unique constraint")) &&
        ex["message"].includes("u_units")
      ) {
        throw Error("Entry already exists!");
      } else {
        throw ex;
      }
    }
  }

  async update(unitCode, dto: UpdateUnitDto, updatedByUserId: string) {
    try {
      return await this.unitsRepo.manager.transaction(async (entityManager) => {
        let unit = await entityManager.findOne(Units, {
          where: {
            unitCode,
            active: true,
          },
        });
        if (!unit) {
          throw Error(UNIT_ERROR_NOT_FOUND);
        }
        unit.rfid = dto.rfid;
        unit.chassisNo = dto.chassisNo;
        unit.color = dto.color;
        unit.description = dto.description;
        unit.lastUpdatedAt = await getDate();

        const model = await entityManager.findOne(Model, {
          where: {
            modelId: dto.modelId,
          },
        });
        if (!model) {
          throw Error(MODEL_ERROR_NOT_FOUND);
        }
        unit.model = model;

        const updatedBy = await entityManager.findOne(EmployeeUsers, {
          where: {
            employeeUserId: updatedByUserId,
            active: true,
          },
        });
        if (!updatedBy) {
          throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
        }
        unit.updatedBy = updatedBy;

        const location = await entityManager.findOne(Locations, {
          where: {
            locationId: dto.locationId,
            active: true,
          },
        });
        if (!location) {
          throw Error(LOCATIONS_ERROR_NOT_FOUND);
        }
        unit.location = location;

        await entityManager.save(Units, unit);
        unit = await entityManager.findOne(Units, {
          where: {
            unitId: unit.unitId,
            active: true,
          },
          relations: {
            model: true,
            location: true,
            status: true,
            createdBy: true,
            updatedBy: true,
          },
        });
        delete unit?.createdBy?.password;
        delete unit?.createdBy?.refreshToken;
        delete unit?.updatedBy?.password;
        delete unit?.updatedBy?.refreshToken;
        return unit;
      });
    } catch (ex) {
      if (
        ex["message"] &&
        (ex["message"].includes("duplicate key") ||
          ex["message"].includes("violates unique constraint")) &&
        ex["message"].includes("u_units")
      ) {
        throw Error("Entry already exists!");
      } else {
        throw ex;
      }
    }
  }

  async unitLogs(logsDto: LogsDto) {
    return await this.unitsRepo.manager.transaction(async (entityManager) => {
      const unitLogs: UnitLogs[] = [];
      const registerEvents: Array<{
        rfid: string;
        scannerCode: string;
        timestamp: Date;
        employeeUserId: string;
      }> = [];

      for (const log of logsDto.data) {
        const [unit, scanner, lastLog] = await Promise.all([
          entityManager.findOne(Units, {
            where: { rfid: log.rfid, active: true },
          }),
          entityManager.findOne(Scanner, {
            where: { scannerCode: log.scannerCode, active: true },
            relations: {
              status: true,
              location: true,
              assignedEmployeeUser: true,
            },
          }),
          entityManager
            .createQueryBuilder(UnitLogs, "ul")
            .innerJoin("ul.unit", "u")
            .leftJoinAndSelect("ul.status", "status")
            .leftJoinAndSelect("ul.location", "location")
            .where("u.rfid = :rfid AND u.active = true", { rfid: log.rfid })
            .orderBy("ul.timestamp", "DESC")
            .limit(1)
            .getOne(),
        ]);

        if (!scanner) continue;

        if (!unit && scanner) {
          registerEvents.push({
            rfid: log.rfid,
            scannerCode: log.scannerCode,
            timestamp: log.timestamp,
            employeeUserId: scanner?.assignedEmployeeUser?.employeeUserId,
          });
          continue;
        }

        const newStatusId = Number(scanner.status?.statusId);
        if (!newStatusId) continue; // scanner must have a status

        const prevStatusId =
          Number(lastLog?.status?.statusId) ?? STATUS.REGISTERED;

        // Only allow forward moves: new > prev
        // - same (new == prev) => skip
        // - backward (new < prev) => skip
        const isForward = prevStatusId === null || newStatusId > prevStatusId;
        if (!isForward) continue;

        // Create new log (record prevStatus for auditing)
        const unitLog = new UnitLogs();
        unitLog.timestamp = new Date(log.timestamp);
        unitLog.unit = unit;
        unitLog.status = scanner.status;
        unitLog.prevStatus = lastLog?.status ?? null;
        unitLog.location = scanner.location;
        unitLog.employeeUser = scanner.assignedEmployeeUser;

        unitLogs.push(unitLog);
      }

      // Prepare parallel tasks (DB save + Pusher batch)
      const tasks: Promise<unknown>[] = [];

      if (unitLogs.length) {
        tasks.push(entityManager.save(UnitLogs, unitLogs));
      } else {
        tasks.push(Promise.resolve()); // keep indexes aligned
      }

      // Fire Pusher: de-dupe then send all in parallel
      if (registerEvents.length) {
        const dedup = new Set<string>();
        const unique = registerEvents.filter((e) => {
          const k = `${e.rfid}|${e.scannerCode}`;
          if (dedup.has(k)) return false;
          dedup.add(k);
          return true;
        });

        const pusherCalls = unique
          .filter((e) => !!e.employeeUserId) // avoid invalid channel ids
          .map((e) =>
            this.pusherService.sendTriggerRegister(
              e.employeeUserId!, // guaranteed by filter
              e
            )
          );

        tasks.push(
          pusherCalls.length
            ? Promise.allSettled(pusherCalls)
            : Promise.resolve([])
        );
      } else {
        tasks.push(Promise.resolve([]));
      }

      // One await for both branches
      await Promise.all(tasks);

      return unitLogs;
    });
  }

  async delete(unitCode, updatedByUserId: string) {
    return await this.unitsRepo.manager.transaction(async (entityManager) => {
      let unit = await entityManager.findOne(Units, {
        where: {
          unitCode,
          active: true,
        },
      });
      if (!unit) {
        throw Error(UNIT_ERROR_NOT_FOUND);
      }
      unit.active = false;
      unit.lastUpdatedAt = await getDate();

      const updatedBy = await entityManager.findOne(EmployeeUsers, {
        where: {
          employeeUserId: updatedByUserId,
          active: true,
        },
      });
      if (!updatedBy) {
        throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
      }
      unit.updatedBy = updatedBy;
      await entityManager.save(Units, unit);
      unit = await entityManager.findOne(Units, {
        where: {
          unitId: unit.unitId,
          active: true,
        },
        relations: {
          model: true,
          location: true,
          status: true,
          createdBy: true,
          updatedBy: true,
        },
      });
      delete unit?.createdBy?.password;
      delete unit?.createdBy?.refreshToken;
      delete unit?.updatedBy?.password;
      delete unit?.updatedBy?.refreshToken;
      return unit;
    });
  }
}
