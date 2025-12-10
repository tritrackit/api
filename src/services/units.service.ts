import { LogsDto } from "./../core/dto/unit/unit-logs.dto";
import { Locations } from "src/db/entities/Locations";
import { Injectable, Logger } from "@nestjs/common";
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
import { FIXED_LOCATIONS, LOCATIONS_ERROR_NOT_FOUND } from "src/common/constant/locations.constant";
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
  private readonly logger = new Logger(UnitsService.name);

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

        const statusKey = CacheKeys.status.byId(STATUS.FOR_DELIVERY.toString());
        let status = this.cacheService.get<Status>(statusKey);
        if (!status) {
          status = await entityManager.findOne(Status, {
            where: {
              statusId: STATUS.FOR_DELIVERY.toString(),
            },
          });
          this.cacheService.set(statusKey, status);
        }
        if (!status) {
          throw Error("Status not found");
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

  private cleanUnitResponse(unit: any) {
    if (!unit) return unit;
    
    const cleaned = { ...unit };
    
    if (cleaned.createdBy) {
      cleaned.createdBy = this.cleanEmployeeUser(cleaned.createdBy);
    }
    if (cleaned.updatedBy) {
      cleaned.updatedBy = this.cleanEmployeeUser(cleaned.updatedBy);
    }
    if (cleaned.location?.createdBy) {
      cleaned.location.createdBy = this.cleanEmployeeUser(cleaned.location.createdBy);
    }
    if (cleaned.location?.updatedBy) {
      cleaned.location.updatedBy = this.cleanEmployeeUser(cleaned.location.updatedBy);
    }
    
    return cleaned;
  }

  private cleanEmployeeUser(employeeUser: any) {
    if (!employeeUser) return employeeUser;
    
    const cleaned = { ...employeeUser };
    
    delete cleaned.password;
    delete cleaned.refreshToken;
    delete cleaned.createdBy;
    delete cleaned.updatedBy;
    
    if (cleaned.role) {
      delete cleaned.role.createdBy;
      delete cleaned.role.updatedBy;
    }
    
    return cleaned;
  }

  private cleanLocation(location: any) {
    if (!location) return location;
    
    const cleaned = { ...location };
    delete cleaned.createdBy;
    delete cleaned.updatedBy;
    return cleaned;
  }

  private cleanLocationUpdateResponse(response: any) {
    if (!response) return response;
    
    const cleaned = { ...response };
    
    if (cleaned.unit) {
      cleaned.unit = this.cleanUnitResponse(cleaned.unit);
    }
    if (cleaned.previousLocation) {
      cleaned.previousLocation = this.cleanLocation(cleaned.previousLocation);
    }
    if (cleaned.newLocation) {
      cleaned.newLocation = this.cleanLocation(cleaned.newLocation);
    }
    
    return cleaned;
  }

  private async createWithScannerStatus(
    dto: CreateUnitDto, 
    createdByUserId: string, 
    status: Status
  ) {
    return await this.unitsRepo.manager.transaction(async (entityManager) => {
      let unit = new Units();
      unit.rfid = dto.rfid;
      unit.chassisNo = dto.chassisNo;
      unit.color = dto.color;
      unit.description = dto.description;
      unit.dateCreated = await getDate();

      if (dto.modelId) {
        const model = await entityManager.findOne(Model, {
          where: { modelId: dto.modelId }
        });
        if (!model) throw Error(MODEL_ERROR_NOT_FOUND);
        unit.model = model;
      }
      // If no modelId provided, unit.model will be null (allowed for auto-registration)

      unit.status = status;

      const location = await entityManager.findOne(Locations, {
        where: { locationId: dto.locationId, active: true }
      });
      if (!location) throw Error(LOCATIONS_ERROR_NOT_FOUND);
      unit.location = location;

      // Set created by
      const createdBy = await entityManager.findOne(EmployeeUsers, {
        where: { employeeUserId: createdByUserId, active: true }
      });
      if (!createdBy) throw Error(EMPLOYEE_USER_ERROR_USER_NOT_FOUND);
      unit.createdBy = createdBy;

      unit = await entityManager.save(Units, unit);
      unit.unitCode = `U-${generateIndentityCode(unit.unitId)}`;
      await entityManager.save(Units, unit);

      const unitLogs = new UnitLogs();
      unitLogs.timestamp = await getDate();
      unitLogs.unit = unit;
      unitLogs.status = status;
      unitLogs.location = location;
      unitLogs.employeeUser = createdBy;
      await entityManager.save(UnitLogs, unitLogs);

      this.cacheService.delByPrefix(CacheKeys.units.prefix);
      
      const result = await entityManager.findOne(Units, {
        where: { unitId: unit.unitId, active: true },
        relations: ["model", "location", "status", "createdBy", "updatedBy"]
      });

      return this.cleanUnitResponse(result);
    });
  }

  async registerUnit(
    rfid: string, 
    scannerCode: string, 
    additionalData: {
      chassisNo?: string;
      color?: string;
      description?: string;
      modelId?: string;
    } = {}
  ) {
    return await this.unitsRepo.manager.transaction(async (entityManager) => {
      const scanner = await entityManager.findOne(Scanner, {
        where: { 
          scannerCode, 
          active: true,
          scannerType: "REGISTRATION" 
        },
        relations: ["location", "status", "assignedEmployeeUser"]
      });

      if (!scanner) {
        throw Error("Registration scanner not found");
      }

      const existingUnit = await entityManager.findOne(Units, {
        where: { rfid, active: true }
      });

      if (existingUnit) {
        throw Error("Unit with this RFID already registered");
      }

      if (!scanner.assignedEmployeeUser) {
        throw Error("Registration scanner does not have an assigned employee user");
      }

      const createUnitDto = new CreateUnitDto();
      createUnitDto.rfid = rfid;
      createUnitDto.chassisNo = additionalData.chassisNo || `CH-${rfid}`;
      createUnitDto.color = additionalData.color || "Auto-Registered";
      createUnitDto.description = additionalData.description || `Auto-registered at ${scanner.location.name}`;
      createUnitDto.modelId = additionalData.modelId;
      createUnitDto.locationId = scanner.location.locationId;

      const result = await this.createWithScannerStatus(createUnitDto, scanner.assignedEmployeeUser.employeeUserId, scanner.status);
      
      this.cacheService.delByPrefix(CacheKeys.units.prefix);
      
      if (result && scanner.assignedEmployeeUser?.employeeUserCode) {
        this.pusherService.sendTriggerRegister(scanner.assignedEmployeeUser.employeeUserCode, {
          rfid: result.rfid,
          scannerCode: scannerCode,
          employeeUser: scanner.assignedEmployeeUser,
          location: scanner.location,
          timestamp: new Date()
        });
        this.pusherService.reSync('units', {
          rfid: result.rfid,
          action: 'UNIT_REGISTERED',
          unitCode: result.unitCode,
          location: result.location?.name,
          status: result.status?.name,
          timestamp: new Date()
        });
        this.logger.debug(`Pusher events triggered for registered unit: ${result.unitCode} (RFID: ${result.rfid})`);
      }
      
      return this.cleanUnitResponse(result);
    });
  }

  async updateUnitLocation(rfid: string, scannerCode: string) {
    const result = await this.unitsRepo.manager.transaction(async (entityManager) => {
      const scanner = await entityManager.findOne(Scanner, {
        where: { 
          scannerCode, 
          active: true,
          scannerType: "LOCATION" 
        },
        relations: ["location", "status", "assignedEmployeeUser"]
      });
  
      if (!scanner) {
        throw Error("Location scanner not found");
      }
  
      const unit = await entityManager.findOne(Units, {
        where: { rfid, active: true },
        relations: ["location", "status"]
      });
  
      if (!unit) {
        throw Error("Unit not found - please register first using registration scanner");
      }
  
      const previousLocation = unit.location;
      const previousStatus = unit.status;
      
      const scannerLocationId = scanner.location.locationId;
      const unitLocationId = unit.location.locationId;
      
      if (scannerLocationId === FIXED_LOCATIONS.WAREHOUSE_5.id) {
        if (unitLocationId === FIXED_LOCATIONS.WAREHOUSE_5.id) {
          const openArea = await entityManager.findOne(Locations, {
            where: { locationId: FIXED_LOCATIONS.OPEN_AREA.id, active: true }
          });
          const forDeliveryStatus = await entityManager.findOne(Status, {
            where: { statusId: STATUS.FOR_DELIVERY.toString() }
          }); 
          
          if (!openArea || !forDeliveryStatus) {
            throw Error("Configuration error: Open Area or FOR DELIVERY status not found");
          }
          
          unit.location = openArea;
          unit.status = forDeliveryStatus;
        } else if (unitLocationId === FIXED_LOCATIONS.OPEN_AREA.id) {
          unit.location = scanner.location;
          unit.status = scanner.status;
        } else {
          throw Error(`Unit must be in Open Area to enter Warehouse 5. Current location: ${unit.location.name}`);
        }
      } else {
        // For other location scanners, use simple logic
        if (scannerLocationId === unitLocationId) {
          throw Error(`Unit is already at ${scanner.location.name}. No update needed.`);
        }
        unit.location = scanner.location;
        unit.status = scanner.status;
      }
  
      unit.lastUpdatedAt = new Date();
      const updatedUnit = await entityManager.save(Units, unit);
  
      const unitLog = new UnitLogs();
      unitLog.timestamp = new Date();
      unitLog.unit = updatedUnit;
      unitLog.status = unit.status;
      unitLog.prevStatus = previousStatus;
      unitLog.location = unit.location;
      unitLog.employeeUser = scanner.assignedEmployeeUser;
      
      await entityManager.save(UnitLogs, unitLog);
  
      return {
        unit: updatedUnit,
        previousLocation,
        newLocation: unit.location,
        previousStatus,
        newStatus: unit.status,
        action: scannerLocationId === FIXED_LOCATIONS.WAREHOUSE_5.id && unitLocationId === FIXED_LOCATIONS.WAREHOUSE_5.id ? "EXITED_WAREHOUSE_5" : 
                 scannerLocationId === FIXED_LOCATIONS.WAREHOUSE_5.id && unitLocationId === FIXED_LOCATIONS.OPEN_AREA.id ? "ENTERED_WAREHOUSE_5" : 
                 "LOCATION_UPDATED"
      };
    });

    const unitCacheKey = this.keyUnit(result.unit.rfid);
    const lastLogCacheKey = this.keyLastLog(result.unit.rfid);
    const unitCodeCacheKey = CacheKeys.units.byCode(result.unit.unitCode);
    
    this.cacheService.del(unitCacheKey);
    this.cacheService.del(lastLogCacheKey);
    this.cacheService.del(unitCodeCacheKey);
    this.cacheService.delByPrefix(CacheKeys.units.prefix);
    
    this.logger.debug(`Cache invalidated for unit ${result.unit.unitCode} (RFID: ${result.unit.rfid}) before Pusher trigger`);

    this.pusherService.reSync('units', {
      rfid: result.unit.rfid,
      action: result.action,
      location: result.newLocation.name,
      status: result.newStatus.name,
      previousLocation: result.previousLocation.name,
      previousStatus: result.previousStatus.name,
      unitCode: result.unit.unitCode,
      timestamp: new Date()
    });
  
      return this.cleanLocationUpdateResponse(result);
  }

  async update(unitCode, dto: UpdateUnitDto, updatedByUserId: string) {
    try {
      const result = await this.unitsRepo.manager.transaction(async (entityManager) => {
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

        const previousLocation = unit.location;
        const previousStatus = unit.status;
        let locationChanged = false;
        let statusChanged = false;

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

        if (dto.locationId) {
          const locationKey = CacheKeys.locations.byId(dto.locationId);
          let newLocation = this.cacheService.get<Locations>(locationKey);
          if (!newLocation) {
            newLocation = await entityManager.findOne(Locations, {
              where: {
                locationId: dto.locationId,
                active: true,
              },
            });
            if (newLocation) {
              this.cacheService.set(locationKey, newLocation);
            }
          }
          if (!newLocation) {
            throw Error(LOCATIONS_ERROR_NOT_FOUND);
          }
          if (unit.location.locationId !== newLocation.locationId) {
            unit.location = newLocation;
            locationChanged = true;
            this.logger.debug(`Location changed: ${previousLocation.name} → ${newLocation.name}`);
            
            if (newLocation.name === 'Delivered' || newLocation.locationCode === 'DELIVERED') {
              const deliveredStatusKey = CacheKeys.status.byId(STATUS.DELIVERED.toString());
              let deliveredStatus = this.cacheService.get<Status>(deliveredStatusKey);
              if (!deliveredStatus) {
                deliveredStatus = await entityManager.findOne(Status, {
                  where: {
                    statusId: STATUS.DELIVERED.toString(),
                  },
                });
                if (deliveredStatus) {
                  this.cacheService.set(deliveredStatusKey, deliveredStatus);
                }
              }
              if (deliveredStatus && unit.status.statusId !== deliveredStatus.statusId) {
                unit.status = deliveredStatus;
                statusChanged = true;
                this.logger.debug(`Status auto-updated to DELIVERED (${STATUS.DELIVERED}) because location is DELIVERED`);
              } else if (!deliveredStatus) {
                this.logger.warn(`DELIVERED status (ID: ${STATUS.DELIVERED}) not found in database.`);
              }
            }
          }
        }

        if (dto.statusId) {
          const statusKey = CacheKeys.status.byId(dto.statusId);
          let newStatus = this.cacheService.get<Status>(statusKey);
          if (!newStatus) {
            newStatus = await entityManager.findOne(Status, {
              where: {
                statusId: dto.statusId,
              },
            });
            if (newStatus) {
              this.cacheService.set(statusKey, newStatus);
            }
          }
          if (!newStatus) {
            throw Error("Status not found");
          }
          if (unit.status.statusId !== newStatus.statusId) {
            unit.status = newStatus;
            statusChanged = true;
            this.logger.debug(`Status changed: ${previousStatus.name} → ${newStatus.name}`);
            
            if (newStatus.statusId === STATUS.DELIVERED.toString() || Number(newStatus.statusId) === STATUS.DELIVERED) {
              let deliveredLocation: Locations | null = null;
              
              deliveredLocation = await entityManager.findOne(Locations, {
                where: {
                  locationCode: 'DELIVERED',
                  active: true,
                },
              });
              
              // If not found by code, try by name
              if (!deliveredLocation) {
                deliveredLocation = await entityManager.findOne(Locations, {
                  where: {
                    name: 'Delivered',
                    active: true,
                  },
                });
              }
              
              if (!deliveredLocation && FIXED_LOCATIONS.DELIVERED.id) {
                const deliveredLocationKey = CacheKeys.locations.byId(FIXED_LOCATIONS.DELIVERED.id);
                deliveredLocation = this.cacheService.get<Locations>(deliveredLocationKey);
                if (!deliveredLocation) {
                  deliveredLocation = await entityManager.findOne(Locations, {
                    where: {
                      locationId: FIXED_LOCATIONS.DELIVERED.id,
                      active: true,
                    },
                  });
                  if (deliveredLocation) {
                    this.cacheService.set(deliveredLocationKey, deliveredLocation);
                  }
                }
              }
              
              if (deliveredLocation && unit.location.locationId !== deliveredLocation.locationId) {
                unit.location = deliveredLocation;
                locationChanged = true;
                this.logger.debug(`Location auto-updated to DELIVERED because status is DELIVERED`);
              } else if (!deliveredLocation) {
                this.logger.warn(`DELIVERED location not found in database. Please ensure a location with name 'Delivered' or code 'DELIVERED' exists.`);
              }
            }
          }
        }

        // Get updatedBy user
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

        if (locationChanged || statusChanged) {
          const unitLog = new UnitLogs();
          unitLog.timestamp = await getDate();
          unitLog.unit = unit;
          unitLog.status = unit.status;
          unitLog.prevStatus = previousStatus;
          unitLog.location = unit.location;
          unitLog.employeeUser = updatedBy;
          await entityManager.save(UnitLogs, unitLog);
          this.logger.debug(`UnitLog created for manual update: location=${locationChanged}, status=${statusChanged}`);
        }

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
        
        this.cacheService.del(CacheKeys.units.byCode(unit.unitCode));
        this.cacheService.delByPrefix(CacheKeys.units.prefix);
        
        return {
          unit,
          locationChanged,
          statusChanged,
          previousLocation,
          previousStatus,
          newLocation: unit.location,
          newStatus: unit.status
        };
      });
      
      if (result.unit) {
        const pusherData: any = {
          rfid: result.unit.rfid,
          action: result.locationChanged || result.statusChanged ? 'LOCATION_UPDATED' : 'UNIT_UPDATED',
          unitCode: result.unit.unitCode,
          changes: {
            rfid: dto.rfid,
            chassisNo: dto.chassisNo,
            color: dto.color,
            description: dto.description,
            modelId: dto.modelId
          },
          timestamp: new Date()
        };

        if (result.locationChanged || result.statusChanged) {
          pusherData.location = result.newLocation.name;
          pusherData.status = result.newStatus.name;
          pusherData.previousLocation = result.previousLocation.name;
          pusherData.previousStatus = result.previousStatus.name;
        }

        this.pusherService.reSync('units', pusherData);
        this.logger.debug(`Pusher event triggered for manual unit update: ${result.unit.unitCode} (location=${result.locationChanged}, status=${result.statusChanged})`);
      }
      
      return result.unit;
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

      // 🔥 FIX: Store unitCode before deletion (needed for cache invalidation)
      const savedUnitCode = unit.unitCode;
      const savedUnitId = unit.unitId;

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
      
      const deletedUnit = await entityManager.findOne(Units, {
        where: {
          unitId: savedUnitId,
        },
        relations: {
          model: true,
          location: true,
          status: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      if (!deletedUnit) {
      delete unit?.createdBy?.password;
      delete unit?.createdBy?.refreshToken;
      delete unit?.updatedBy?.password;
      delete unit?.updatedBy?.refreshToken;
        this.cacheService.del(CacheKeys.units.byCode(savedUnitCode));
      this.cacheService.delByPrefix(CacheKeys.units.prefix);
      return unit;
      }

      delete deletedUnit?.createdBy?.password;
      delete deletedUnit?.createdBy?.refreshToken;
      delete deletedUnit?.updatedBy?.password;
      delete deletedUnit?.updatedBy?.refreshToken;
      
      this.cacheService.del(CacheKeys.units.byCode(savedUnitCode));
      this.cacheService.delByPrefix(CacheKeys.units.prefix);
      
      return deletedUnit;
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
    this.cacheService.set(key, scanner ?? null, { ttlSeconds: 5 });
    return scanner ?? null;
  }

  private async getUnitCached(
    em: EntityManager,
    rfid: string
  ): Promise<Units | null> {
    const key = this.keyUnit(rfid);
    const cached = this.cacheService.get<Units | null>(key);
    if (cached !== undefined) return cached;

    const unit = await em.findOne(Units, { where: { rfid, active: true }, relations: ["location", "status", "model"]  });
    this.cacheService.set(key, unit ?? null, { ttlSeconds: 2 });
    return unit ?? null;
  }

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

    this.cacheService.set(key, lastLog ?? null, { ttlSeconds: 1 });
    return lastLog ?? null;
  }

  async unitLogs(logsDto: LogsDto, scannerCode: string) {
    this.logger.debug('=== DEBUG unitLogs START ===');
    this.logger.debug(`Scanner Code: ${scannerCode}`);
    this.logger.debug(`Data received: ${JSON.stringify(logsDto.data)}`);
    
    const result = await this.unitsRepo.manager.transaction(async (entityManager) => {
      const unitLogs: UnitLogs[] = [];
      const registerEvents: Array<{
        rfid: string;
        scannerCode: string;
        employeeUser: EmployeeUsers;
        location: Locations;
        timestamp: Date;
      }> = [];
  
      if (!logsDto?.data?.length) {
        this.logger.warn('No data in logsDto');
        return { unitLogs, rfidsToNotify: [], registerEvents: [] };
      }
  
      const scanner = await this.getScannerCached(entityManager, scannerCode);
      this.logger.debug(`Scanner found: ${scanner?.name}`);
      this.logger.debug(`Scanner Type: ${scanner?.scannerType}`);
      this.logger.debug(`Scanner Location: ${scanner?.location?.name}`);
      this.logger.debug(`Scanner Status: ${scanner?.status?.name} (${scanner?.status?.statusId})`);
      
      if (!scanner) {
        this.logger.warn('Scanner not found!');
        return { unitLogs: [], rfidsToNotify: [], registerEvents: [] };
      }
  
      const unitMemo = new Map<string, Units | null>();
      const lastLogMemo = new Map<string, UnitLogs | null>();
  
      for (const log of logsDto.data) {
        const rfid = String(log.rfid);
        this.logger.debug(`=== Processing RFID: ${rfid} ===`);
  
        let unit = unitMemo.get(rfid) ?? null;
        if (unit === null && !unitMemo.has(rfid)) {
          unit = await this.getUnitCached(entityManager, rfid);
          unitMemo.set(rfid, unit);
        }
  
        this.logger.debug(`Unit exists? ${!!unit}`);
        if (unit) {
          this.logger.debug(`Unit Code: ${unit.unitCode}`);
          this.logger.debug(`Current Location: ${unit.location?.name} (${unit.location?.locationId})`);
          this.logger.debug(`Current Status: ${unit.status?.name} (${unit.status?.statusId})`);
        }
  
        if (!unit) {
          if (scanner.scannerType === "REGISTRATION") {
            this.logger.debug(`Registration scanner - sending registration event for new RFID`);
            registerEvents.push({
              rfid,
              scannerCode,
              timestamp: log.timestamp,
              employeeUser: scanner.assignedEmployeeUser,
              location: scanner.location,
            });
          } else {
            this.logger.error(`Location scanner "${scanner.name}" (${scannerCode}) scanned unregistered RFID: ${rfid}`);
          }
          continue;
        }
  
        if (scanner.scannerType === "LOCATION") {
          try {
            this.logger.debug(`Calling updateUnitLocation() for location scanner...`);
            await this.updateUnitLocation(rfid, scannerCode);
            this.logger.debug(`updateUnitLocation() success - Pusher triggered automatically`);
            
            continue;
          } catch (error) {
            this.logger.error(`updateUnitLocation() failed: ${error.message}`, error.stack);
          }
        }
  
        let lastLog = lastLogMemo.get(rfid) ?? null;
        if (lastLog === null && !lastLogMemo.has(rfid)) {
          lastLog = await this.getLastLogCached(entityManager, rfid);
          lastLogMemo.set(rfid, lastLog);
        }
  
        this.logger.debug(`Last Log Status: ${lastLog?.status?.name} (${lastLog?.status?.statusId})`);
        this.logger.debug(`Last Log Location: ${lastLog?.location?.name}`);
  
        const newStatusId = Number(scanner.status?.statusId);
        this.logger.debug(`Scanner New Status: ${scanner.status?.name} (${newStatusId})`);
        this.logger.debug(`Scanner New Location: ${scanner.location?.name} (${scanner.location?.locationId})`);
  
        if (!newStatusId) {
          this.logger.warn('No status ID found in scanner, skipping');
          continue;
        }
  
        const isSameLocation = unit.location?.locationId === scanner.location?.locationId;
        this.logger.debug(`Same location? ${isSameLocation}`);
  
        if (scanner.scannerType === "REGISTRATION") {
          const prevStatusId = Number(lastLog?.status?.statusId) ?? STATUS.FOR_DELIVERY;
          const isForward = prevStatusId === null || newStatusId > prevStatusId;
          this.logger.debug(`Registration scanner - Is Forward? ${isForward} (${prevStatusId} → ${newStatusId})`);
          if (!isForward) {
            this.logger.warn(`Registration scanner blocked - not forward progression`);
            continue;
          }
        } else {
          this.logger.debug(`Location scanner - allowing any status change`);
        }
  
        const shouldCreateLog = !isSameLocation || (unit.status?.statusId !== scanner.status?.statusId);
        this.logger.debug(`Should create UnitLog? ${shouldCreateLog}`);
        this.logger.debug(`  - Location changed? ${!isSameLocation}`);
        this.logger.debug(`  - Status changed? ${unit.status?.statusId !== scanner.status?.statusId}`);
  
        if (!shouldCreateLog) {
          this.logger.debug(`No change needed - unit already at this location/status`);
          continue;
        }
  
        this.logger.debug(`Creating UnitLog:`);
        this.logger.debug(`  Location: ${unit.location?.name} → ${scanner.location?.name}`);
        this.logger.debug(`  Status: ${unit.status?.name} → ${scanner.status?.name}`);
        this.logger.debug(`  Employee: ${scanner.assignedEmployeeUser?.employeeUserCode}`);
  
        const unitLog = new UnitLogs();
        unitLog.timestamp = new Date(log.timestamp);
        unitLog.unit = unit;
        unitLog.status = scanner.status;
        unitLog.prevStatus = lastLog?.status ?? null;
        unitLog.location = scanner.location;
        unitLog.employeeUser = scanner.assignedEmployeeUser;
  
        unitLogs.push(unitLog);
        this.logger.debug(`UnitLog added to batch`);
      }
  
      this.logger.debug(`=== Summary ===`);
      this.logger.debug(`UnitLogs to create: ${unitLogs.length}`);
      this.logger.debug(`Register events: ${registerEvents.length}`);
  
      if (unitLogs.length) {
        this.logger.log(`Saving ${unitLogs.length} UnitLogs to database...`);
        await entityManager.save(UnitLogs, unitLogs);
      } else {
        this.logger.debug(`No UnitLogs to save`);
      }

      const rfidsToNotify = Array.from(
        new Set(unitLogs.map((l) => l.unit.rfid))
      );

        const dedup = new Set<string>();
      const uniqueRegisterEvents = registerEvents.filter((e) => {
          const k = `${e.rfid}|${e.scannerCode}`;
          if (dedup.has(k)) return false;
          dedup.add(k);
          return true;
        });
  
      this.logger.debug(`Transaction completed`);

      return {
        unitLogs,
        rfidsToNotify,
        registerEvents: uniqueRegisterEvents
      };
    });

    if (result && typeof result === 'object' && 'rfidsToNotify' in result) {
      if (result.rfidsToNotify && result.rfidsToNotify.length > 0) {
        this.logger.debug(`Triggering Pusher events for ${result.rfidsToNotify.length} units (non-blocking)...`);
        result.rfidsToNotify.forEach((rfid: string) => {
          this.pusherService.reSync('units', {
            rfid: rfid,
            action: 'LOCATION_UPDATED',
            timestamp: new Date()
          });
        });
      }

      if (result.registerEvents && result.registerEvents.length > 0) {
        this.logger.debug(`Triggering ${result.registerEvents.length} registration events via Pusher (non-blocking)...`);
        result.registerEvents
          .filter((e) => {
            const hasEmployeeCode = !!e.employeeUser?.employeeUserCode;
            if (!hasEmployeeCode) {
              this.logger.warn(`Registration event filtered out - missing employeeUserCode for RFID: ${e.rfid}`);
            }
            return hasEmployeeCode;
          })
          .forEach((e) => {
            this.logger.debug(`Sending registration event for RFID: ${e.rfid}, Employee: ${e.employeeUser?.employeeUserCode}`);
            
            this.pusherService.sendTriggerRegister(e.employeeUser?.employeeUserCode!, e);
            
            this.pusherService.reSync('units', {
              rfid: e.rfid,
              action: 'RFID_DETECTED',
              scannerCode: e.scannerCode,
              location: e.location?.name,
              employeeUserCode: e.employeeUser?.employeeUserCode,
              timestamp: e.timestamp || new Date()
            });
          });
      }

      this.logger.debug(`All Pusher events triggered`);
  
      if (result.unitLogs && result.unitLogs.length) {
        const rfidsToUpdate = Array.from(
          new Set(result.unitLogs.map((l) => l.unit.rfid))
        );
        this.logger.debug(`Updating cache for ${rfidsToUpdate.length} RFIDs`);
        for (const rfid of rfidsToUpdate) {
          const newest =
            result.unitLogs
              .filter((l) => l.unit.rfid === rfid)
              .sort((a, b) => +b.timestamp - +a.timestamp)[0] ?? null;
  
          this.cacheService.set(this.keyLastLog(rfid), newest, {
            ttlSeconds: 1,
          });
        }
      }
  
      this.logger.debug('=== DEBUG unitLogs END ===');
      return result.unitLogs;
    }

    this.logger.debug('=== DEBUG unitLogs END ===');
    return Array.isArray(result) ? result : [];
  }

  async getActivityHistory(
    unitCode: string,
    pageSize: number = 50,
    pageIndex: number = 0
  ): Promise<{ results: UnitLogs[]; total: number }> {
    // First, get the unit to find its unitId
    const unit = await this.unitsRepo.findOne({
      where: {
        unitCode,
        active: true,
      },
      select: ['unitId'],
    });

    if (!unit) {
      throw Error(UNIT_ERROR_NOT_FOUND);
    }

    const cacheKey = `unit:history:${unitCode}:p${pageIndex}:s${pageSize}`;
    const cached = this.cacheService.get<{ results: UnitLogs[]; total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    const skip = pageIndex * pageSize;
    const take = pageSize;

    const [results, total] = await Promise.all([
      this.unitsRepo.manager.find(UnitLogs, {
        where: {
          unit: { unitId: unit.unitId },
        },
        relations: {
          unit: {
            model: true,
            location: true,
            status: true,
          },
          location: true,
          status: true,
          prevStatus: true,
          employeeUser: {
            role: true,
            pictureFile: true,
          },
        },
        order: {
          timestamp: 'DESC',
        },
        skip,
        take,
      }),
      this.unitsRepo.manager.count(UnitLogs, {
        where: {
          unit: { unitId: unit.unitId },
        },
      }),
    ]);

    const cleanedResults = results.map((log) => {
      const cleaned = { ...log };
      
      if (cleaned.employeeUser) {
        delete cleaned.employeeUser.password;
        delete cleaned.employeeUser.refreshToken;
        if (cleaned.employeeUser.role) {
          delete cleaned.employeeUser.role.createdBy;
          delete cleaned.employeeUser.role.updatedBy;
        }
      }

      if (cleaned.unit) {
        delete cleaned.unit.createdBy?.password;
        delete cleaned.unit.createdBy?.refreshToken;
        delete cleaned.unit.updatedBy?.password;
        delete cleaned.unit.updatedBy?.refreshToken;
      }

      return cleaned;
    });

    const response = {
      results: cleanedResults,
      total,
    };

    this.cacheService.set(cacheKey, response, { ttlSeconds: 30 });

    return response;
  }
}