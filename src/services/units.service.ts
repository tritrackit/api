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
import { EntityManager, Repository } from "typeorm";
import { LOCATIONS_ERROR_NOT_FOUND } from "src/common/constant/locations.constant";
import { Status } from "src/db/entities/Status";
import { STATUS } from "src/common/constant/status.constants";
import { Model } from "src/db/entities/Model";
import { MODEL_ERROR_NOT_FOUND } from "src/common/constant/model.constant";
import { UnitLogs } from "src/db/entities/UnitLogs";
import { PusherService } from "./pusher.service";
import { CacheService } from "./cache.service";
import { CacheKeys } from "src/common/constant/cache.constant";
import { Scanner } from "src/db/entities/Scanner";

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Units)
    private readonly unitsRepo: Repository<Units>,
    private pusherService: PusherService,
    private readonly cacheService: CacheService
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const key = CacheKeys.units.list(
      pageIndex,
      pageSize,
      JSON.stringify(order),
      JSON.stringify(columnDef)
    );
    const cached = this.cacheService.get<{ results: Units[]; total: number }>(
      key
    );
    if (cached) return cached;

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
          model: true,
          status: true,
          location: true,
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

  async getByCode(unitCode) {
    const key = CacheKeys.units.byCode(unitCode);
    const cached = this.cacheService.get<Units>(key);
    if (cached) return cached;
    const result = await this.unitsRepo.findOne({
      where: {
        unitCode,
        active: true,
      },
      relations: {
        createdBy: true,
        updatedBy: true,
        model: true,
        location: true,
        status: true,
      },
    });
    if (!result) {
      throw Error(UNIT_ERROR_NOT_FOUND);
    }
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    this.cacheService.set(key, result);
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

        const modelKey = CacheKeys.model.byId(dto.modelId);
        let model = this.cacheService.get<Model>(modelKey);
        if (!model) {
          model = await entityManager.findOne(Model, {
            where: {
              modelId: dto.modelId,
            },
            relations: {
              createdBy: true,
              updatedBy: true,
            },
          });
          this.cacheService.set(modelKey, model);
        }
        if (!model) {
          throw Error(MODEL_ERROR_NOT_FOUND);
        }
        unit.model = model;

        const statusKey = CacheKeys.status.byId(STATUS.REGISTERED.toString());
        let status = this.cacheService.get<Status>(statusKey);
        if (!status) {
          status = await entityManager.findOne(Status, {
            where: {
              statusId: STATUS.REGISTERED.toString(),
            },
          });
          this.cacheService.set(statusKey, status);
        }
        if (!status) {
          throw Error(LOCATIONS_ERROR_NOT_FOUND);
        }
        unit.status = status;

        const locationKey = CacheKeys.locations.byId(createdByUserId);
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
        unit.location = location;

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
        unit.createdBy = {
          ...createdBy,
        };
        delete unit.createdBy.createdBy;
        delete unit.createdBy.updatedBy;
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
        const unitLogs = new UnitLogs();
        unitLogs.timestamp = await getDate();
        unitLogs.unit = unit;
        unitLogs.status = status;
        unitLogs.location = location;
        unitLogs.employeeUser = createdBy;
        await entityManager.save(UnitLogs, unitLogs);
        delete unit?.createdBy?.password;
        delete unit?.createdBy?.refreshToken;
        delete unit?.updatedBy?.password;
        delete unit?.updatedBy?.refreshToken;
        // Invalidate caches
        this.cacheService.delByPrefix(CacheKeys.units.prefix);
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
        const unitKey = CacheKeys.units.byCode(unitCode);
        let unit = this.cacheService.get<Units>(unitKey);
        if (!unit) {
          unit = await entityManager.findOne(Units, {
            where: {
              unitCode,
              active: true,
            },
            relations: {
              createdBy: true,
              updatedBy: true,
              model: true,
              location: true,
              status: true,
            },
          });
        }
        if (!unit) {
          throw Error(UNIT_ERROR_NOT_FOUND);
        }
        unit.rfid = dto.rfid;
        unit.chassisNo = dto.chassisNo;
        unit.color = dto.color;
        unit.description = dto.description;
        unit.lastUpdatedAt = await getDate();

        const modelKey = CacheKeys.model.byId(dto.modelId);
        let model = this.cacheService.get<Model>(modelKey);
        if (!model) {
          model = await entityManager.findOne(Model, {
            where: {
              modelId: dto.modelId,
            },
            relations: {
              createdBy: true,
              updatedBy: true,
            },
          });
          this.cacheService.set(modelKey, model);
        }
        if (!model) {
          throw Error(MODEL_ERROR_NOT_FOUND);
        }
        unit.model = model;

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
        unit.updatedBy = {
          ...updatedBy,
        };
        delete unit.updatedBy.createdBy;
        delete unit.updatedBy.updatedBy;

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
        // Invalidate caches
        this.cacheService.del(CacheKeys.units.byCode(unit.unitCode));
        this.cacheService.delByPrefix(CacheKeys.units.prefix);
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

  async delete(unitCode, updatedByUserId: string) {
    return await this.unitsRepo.manager.transaction(async (entityManager) => {
      const unitKey = CacheKeys.units.byCode(unitCode);
      let unit = this.cacheService.get<Units>(unitKey);
      if (!unit) {
        unit = await entityManager.findOne(Units, {
          where: {
            unitCode,
            active: true,
          },
          relations: {
            createdBy: true,
            updatedBy: true,
            model: true,
            location: true,
            status: true,
          },
        });
      }
      if (!unit) {
        throw Error(UNIT_ERROR_NOT_FOUND);
      }
      unit.active = false;
      unit.lastUpdatedAt = await getDate();

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
      // Invalidate caches
      this.cacheService.del(CacheKeys.units.byCode(unit.unitCode));
      this.cacheService.delByPrefix(CacheKeys.units.prefix);
      return unit;
    });
  }

  private keyScanner(code: string) {
    return `scanner:code:${code}`;
  }
  private keyUnit(rfid: string) {
    return `unit:rfid:${rfid}`;
  }
  private keyLastLog(rfid: string) {
    return `unitlog:last:${rfid}`;
  }

  // Scanner by scannerCode (cache -> DB)
  private async getScannerCached(
    em: EntityManager,
    code: string
  ): Promise<Scanner | null> {
    const key = this.keyScanner(code);
    const cached = this.cacheService.get<Scanner | null>(key);
    if (
      cached !== undefined &&
      cached.status &&
      cached.location &&
      cached.assignedEmployeeUser
    )
      return cached;

    const scanner = await em.findOne(Scanner, {
      where: { scannerCode: code, active: true },
      relations: { status: true, location: true, assignedEmployeeUser: true },
    });
    this.cacheService.set(key, scanner ?? null, { ttlSeconds: 15 });
    return scanner ?? null;
  }

  // Unit by RFID (cache -> DB)
  private async getUnitCached(
    em: EntityManager,
    rfid: string
  ): Promise<Units | null> {
    const key = this.keyUnit(rfid);
    const cached = this.cacheService.get<Units | null>(key);
    if (cached !== undefined) return cached;

    const unit = await em.findOne(Units, { where: { rfid, active: true } });
    this.cacheService.set(key, unit ?? null, { ttlSeconds: 20 });
    return unit ?? null;
  }

  // Last UnitLog by RFID (cache -> DB)
  private async getLastLogCached(
    em: EntityManager,
    rfid: string
  ): Promise<UnitLogs | null> {
    const key = this.keyLastLog(rfid);
    const cached = this.cacheService.get<UnitLogs | null>(key);
    if (cached !== undefined) return cached;

    const lastLog = await em
      .createQueryBuilder(UnitLogs, "ul")
      .innerJoin("ul.unit", "u")
      .leftJoinAndSelect("ul.status", "status")
      .leftJoinAndSelect("ul.location", "location")
      .where("u.rfid = :rfid AND u.active = true", { rfid })
      .orderBy("ul.timestamp", "DESC")
      .limit(1)
      .getOne();

    this.cacheService.set(key, lastLog ?? null, { ttlSeconds: 10 });
    return lastLog ?? null;
  }

  async unitLogs(logsDto: LogsDto, scannerCode: string) {
    return await this.unitsRepo.manager.transaction(async (entityManager) => {
      const unitLogs: UnitLogs[] = [];
      const registerEvents: Array<{
        rfid: string;
        scannerCode: string;
        employeeUser: EmployeeUsers;
        location: Locations
        timestamp: Date;
      }> = [];

      if (!logsDto?.data?.length) return unitLogs;

      // scanner (cache -> db)
      const scanner = await this.getScannerCached(entityManager, scannerCode);
      if (!scanner) return [];

      // per-call memo to avoid duplicate cache reads for same RFID in this request
      const unitMemo = new Map<string, Units | null>();
      const lastLogMemo = new Map<string, UnitLogs | null>();

      for (const log of logsDto.data) {
        const rfid = String(log.rfid);

        // unit (cache -> db), with per-call memo
        let unit = unitMemo.get(rfid) ?? null;
        if (unit === null && !unitMemo.has(rfid)) {
          unit = await this.getUnitCached(entityManager, rfid);
          unitMemo.set(rfid, unit);
        }

        // if unit doesn't exist, send register event
        if (!unit) {
          registerEvents.push({
            rfid,
            scannerCode,
            timestamp: log.timestamp,
            employeeUser: scanner.assignedEmployeeUser,
            location: scanner.location,
          });
          continue;
        }

        // last log (cache -> db), with per-call memo
        let lastLog = lastLogMemo.get(rfid) ?? null;
        if (lastLog === null && !lastLogMemo.has(rfid)) {
          lastLog = await this.getLastLogCached(entityManager, rfid);
          lastLogMemo.set(rfid, lastLog);
        }

        const newStatusId = Number(scanner.status?.statusId);
        if (!newStatusId) continue; // scanner must have a status

        const prevStatusId =
          Number(lastLog?.status?.statusId) ?? STATUS.REGISTERED;
        const isForward = prevStatusId === null || newStatusId > prevStatusId;
        if (!isForward) continue;

        const unitLog = new UnitLogs();
        unitLog.timestamp = new Date(log.timestamp);
        unitLog.unit = unit;
        unitLog.status = scanner.status;
        unitLog.prevStatus = lastLog?.status ?? null;
        unitLog.location = scanner.location;
        unitLog.employeeUser = scanner.assignedEmployeeUser;

        unitLogs.push(unitLog);
      }

      // DB save + Pusher (same as yours)
      const tasks: Promise<unknown>[] = [];
      if (unitLogs.length) tasks.push(entityManager.save(UnitLogs, unitLogs));
      else tasks.push(Promise.resolve());

      if (registerEvents.length) {
        const dedup = new Set<string>();
        const unique = registerEvents.filter((e) => {
          const k = `${e.rfid}|${e.scannerCode}`;
          if (dedup.has(k)) return false;
          dedup.add(k);
          return true;
        });

        const pusherCalls = unique
          .filter((e) => !!e.employeeUser?.employeeUserCode)
          .map((e) =>
            this.pusherService.sendTriggerRegister(e.employeeUser?.employeeUserCode!, e)
          );

        tasks.push(
          pusherCalls.length
            ? Promise.allSettled(pusherCalls)
            : Promise.resolve([])
        );
      } else {
        tasks.push(Promise.resolve([]));
      }

      await Promise.all(tasks);

      // minimal post-write cache maintenance: refresh last-log cache for affected RFIDs
      if (unitLogs.length) {
        const rfidsToUpdate = Array.from(
          new Set(unitLogs.map((l) => l.unit.rfid))
        );
        for (const rfid of rfidsToUpdate) {
          const newest =
            unitLogs
              .filter((l) => l.unit.rfid === rfid)
              .sort((a, b) => +b.timestamp - +a.timestamp)[0] ?? null;

          this.cacheService.set(this.keyLastLog(rfid), newest, {
            ttlSeconds: 10,
          });
        }
      }

      return unitLogs;
    });
  }
}
