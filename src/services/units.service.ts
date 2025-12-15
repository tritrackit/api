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
    
      unit.status = status;

      const location = await entityManager.findOne(Locations, {
        where: { locationId: dto.locationId, active: true }
      });
      if (!location) throw Error(LOCATIONS_ERROR_NOT_FOUND);
      unit.location = location;

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
  async registerUnitUltraFast(
    rfid: string, 
    scannerCode: string, 
    additionalData: {
      chassisNo?: string;
      color?: string;
      description?: string;
      modelId?: string;
    } = {}
  ) {
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const predictiveSentAt = Date.now();
    
    this.logger.debug(`⚡ ULTRA-FAST Registration start: ${rfid} (${transactionId})`);
    
    const [scanner, existingUnit] = await Promise.all([
      this.getScannerCached(this.unitsRepo.manager, scannerCode),
      this.getUnitCached(this.unitsRepo.manager, rfid)
    ]);
    
    this.sendPredictiveNotification(rfid, scannerCode, transactionId, scanner || undefined);
    
    if (existingUnit) {
      this.sendRegistrationFailed(rfid, transactionId, "Unit already exists");
      throw Error("Unit with this RFID already registered");
    }
    
    if (!scanner) {
      this.sendRegistrationFailed(rfid, transactionId, "Scanner not found");
      throw Error("Registration scanner not found");
    }
    
    if (!scanner.assignedEmployeeUser) {
      this.sendRegistrationFailed(rfid, transactionId, "Scanner does not have assigned employee user");
      throw Error("Registration scanner does not have an assigned employee user");
    }
    
   
    let unit: Units;
    try {
      unit = await this.executeMinimalTransaction(rfid, scanner, additionalData);
    } catch (error) {
      this.sendRegistrationFailed(rfid, transactionId, error.message);
      throw error;
    }
    
    this.clearCacheImmediately(rfid, unit.unitCode);
    this.sendConfirmedNotificationAsync(unit, scanner, scannerCode, transactionId, predictiveSentAt);
    
    this.handleAsyncPostRegistration(unit, scanner);
    
    const totalTime = Date.now() - predictiveSentAt;
    this.logger.debug(`⚡ ULTRA-FAST Registration complete: ${totalTime}ms for ${rfid}`);
    
    const cleanedUnit = await this.unitsRepo.findOne({
      where: { unitId: unit.unitId, active: true },
      relations: ["model", "location", "status", "createdBy", "updatedBy"]
    });
    
    return {
      ...this.cleanUnitResponse(cleanedUnit),
      _predictive: true,
      _transactionId: transactionId,
      _predictiveSentAt: predictiveSentAt,
      _dbCommitTime: Date.now(),
      _totalLatency: totalTime
    };
  }

  private sendPredictiveNotification(rfid: string, scannerCode: string, transactionId: string, scanner?: Scanner) {
    const predictiveData = {
      rfid,
      scannerCode,
      action: 'UNIT_REGISTERING_PREDICTIVE',
      transactionId,
      timestamp: new Date(),
      location: scanner?.location?.name || 'Unknown',
      locationId: scanner?.location?.locationId,
      status: scanner?.status?.name || 'FOR DELIVERY',
      statusId: scanner?.status?.statusId,
      scannerType: scanner?.scannerType || 'REGISTRATION',
      employeeUserCode: scanner?.assignedEmployeeUser?.employeeUserCode,
      _sentAt: Date.now(),
      _predictive: true,
      _priority: 'highest',
      _autoDisplay: true, // Frontend should auto-display CBU form
      _noToast: false // Show notification for new registration
    };
    
    // ⚡ Use ONLY emergency channel for RFID events (no duplicate channels)
    this.pusherService.sendRegistrationUrgent(predictiveData);
  }

  private async executeMinimalTransaction(
    rfid: string, 
    scanner: Scanner,
    additionalData: any
  ): Promise<Units> {
    return await this.unitsRepo.manager.transaction(async (entityManager) => {
      this.logger.debug(`⚡ Starting MINIMAL transaction for: ${rfid}`);
      
      // ⚡ Only CRITICAL DB operations:
      const unit = new Units();
      unit.rfid = rfid;
      unit.chassisNo = additionalData.chassisNo || `CH-${rfid}`;
      unit.color = additionalData.color || "Auto-Registered";
      unit.description = additionalData.description || `Auto-registered at ${scanner.location.name}`;
      unit.dateCreated = new Date();
      
      // Minimal relations (avoid unnecessary joins)
      if (additionalData.modelId) {
        const model = await entityManager.findOne(Model, {
          where: { modelId: additionalData.modelId },
          select: ['modelId'] // Only get ID
        });
        if (model) unit.model = model;
      }
      
      unit.status = scanner.status;
      unit.location = scanner.location;
      unit.createdBy = scanner.assignedEmployeeUser;
      
      // Save unit (CORE operation)
      const savedUnit = await entityManager.save(Units, unit);
      
      // Generate unit code
      savedUnit.unitCode = `U-${generateIndentityCode(savedUnit.unitId)}`;
      await entityManager.save(Units, savedUnit);
      
      this.logger.debug(`⚡ MINIMAL transaction complete for: ${rfid}`);
      return savedUnit;
    });
  }

  private clearCacheImmediately(rfid: string, unitCode: string) {
    // ⚡ Clear cache BEFORE sending Pusher confirmed events
    const unitCacheKey = this.keyUnit(rfid);
    const unitCodeCacheKey = CacheKeys.units.byCode(unitCode);
    
    // Synchronous delete operations
    this.cacheService.del(unitCacheKey);
    this.cacheService.del(unitCodeCacheKey);
    this.cacheService.delByPrefix(CacheKeys.units.prefix);
    
    this.logger.debug(`⚡ Cache cleared IMMEDIATELY for: ${rfid}`);
  }

  private async sendConfirmedNotificationAsync(
    unit: Units, 
    scanner: Scanner, 
    scannerCode: string,
    transactionId: string,
    predictiveSentAt: number
  ) {
    // Get full unit data with all relations for frontend display
    const fullUnit = await this.unitsRepo.findOne({
      where: { unitId: unit.unitId, active: true },
      relations: ["model", "location", "status", "createdBy"]
    });

    const unitData = fullUnit ? {
      unitId: fullUnit.unitId,
      unitCode: fullUnit.unitCode,
      rfid: fullUnit.rfid,
      chassisNo: fullUnit.chassisNo,
      color: fullUnit.color,
      description: fullUnit.description,
      model: fullUnit.model ? {
        modelId: fullUnit.model.modelId,
        modelName: (fullUnit.model as any).modelName || (fullUnit.model as any).name
      } : null,
      location: fullUnit.location ? {
        locationId: fullUnit.location.locationId,
        name: fullUnit.location.name
      } : null,
      status: fullUnit.status ? {
        statusId: fullUnit.status.statusId,
        name: fullUnit.status.name
      } : null
    } : null;

    const confirmedData = {
      rfid: unit.rfid,
      scannerCode,
      action: 'UNIT_REGISTERED_CONFIRMED',
      unitCode: unit.unitCode,
      transactionId,
      location: scanner.location?.name,
      locationId: scanner.location?.locationId,
      status: scanner.status?.name,
      statusId: scanner.status?.statusId,
      timestamp: new Date(),
      _sentAt: Date.now(),
      _predictiveLatency: Date.now() - predictiveSentAt,
      _confirmed: true,
      _autoDisplay: true, // Frontend should auto-display CBU form with details
      _noToast: false, // Show notification for new registration
      unit: unitData // Include full unit data for immediate display
    };
    
    // ⚡ Use ONLY emergency channel for RFID events (no duplicate channels)
    this.pusherService.sendRegistrationUrgent(confirmedData).catch(err => {
      this.logger.debug(`Async Pusher send failed: ${err.message}`);
    });
  }

  private async handleAsyncPostRegistration(unit: Units, scanner: Scanner) {
    // ⚡ Non-critical operations moved to async
    try {
      // 1. Create unit logs (async)
      const unitLogs = new UnitLogs();
      unitLogs.timestamp = new Date();
      unitLogs.unit = unit;
      unitLogs.status = scanner.status;
      unitLogs.location = scanner.location;
      unitLogs.employeeUser = scanner.assignedEmployeeUser;
      
      await this.unitsRepo.manager.save(UnitLogs, unitLogs);
      
    } catch (error) {
      // Don't fail main operation
      this.logger.warn(`Async post-registration failed: ${error.message}`);
    }
  }

  private sendRegistrationFailed(rfid: string, transactionId: string, error: string) {
    this.pusherService.reSync('units', {
      rfid,
      action: 'UNIT_REGISTRATION_FAILED',
      transactionId,
      error,
      timestamp: new Date()
    }, true);
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
    // Delegate to ultra-fast version
    return this.registerUnitUltraFast(rfid, scannerCode, additionalData);
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

    this.logger.debug(`Sending Pusher event for unit ${result.unit.unitCode} (RFID: ${result.unit.rfid})`);

    // Get full unit data for frontend auto-refresh
    const fullUnit = await this.unitsRepo.findOne({
      where: { unitId: result.unit.unitId, active: true },
      relations: ["model", "location", "status"]
    });

    const unitData = fullUnit ? {
      unitId: fullUnit.unitId,
      unitCode: fullUnit.unitCode,
      rfid: fullUnit.rfid,
      chassisNo: fullUnit.chassisNo,
      color: fullUnit.color,
      description: fullUnit.description,
      model: fullUnit.model ? {
        modelId: fullUnit.model.modelId,
        modelName: (fullUnit.model as any).modelName || (fullUnit.model as any).name
      } : null,
      location: fullUnit.location ? {
        locationId: fullUnit.location.locationId,
        name: fullUnit.location.name
      } : null,
      status: fullUnit.status ? {
        statusId: fullUnit.status.statusId,
        name: fullUnit.status.name
      } : null
    } : null;

    this.pusherService.reSync('units', {
      rfid: result.unit.rfid,
      scannerCode: scannerCode, // ⚡ Include scannerCode for emergency channel
      action: result.action,
      location: result.newLocation.name,
      locationId: result.newLocation.locationId,
      status: result.newStatus.name,
      statusId: result.newStatus.statusId,
      previousLocation: result.previousLocation.name,
      previousStatus: result.previousStatus.name,
      unitCode: result.unit.unitCode,
      timestamp: new Date(),
      _autoRefresh: true, // Frontend should auto-refresh unit tracker table
      _noToast: true, // Don't show toast for location updates (already registered)
      unit: unitData // Include full unit data for table update
    }, true); // Urgent flag for immediate delivery

    const unitCacheKey = this.keyUnit(result.unit.rfid);
    const lastLogCacheKey = this.keyLastLog(result.unit.rfid);
    const unitCodeCacheKey = CacheKeys.units.byCode(result.unit.unitCode);
    
    this.cacheService.del(unitCacheKey);
    this.cacheService.del(lastLogCacheKey);
    this.cacheService.del(unitCodeCacheKey);
    this.cacheService.delByPrefix(CacheKeys.units.prefix);
    
    this.logger.debug(`Cache invalidated for unit ${result.unit.unitCode} (RFID: ${result.unit.rfid}) after Pusher trigger`);
  
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
    if (unit) {
      this.cacheService.set(key, unit, { ttlSeconds: 2 });
    }
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
    const processStart = Date.now();
    const requestId = `req_${processStart}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.logger.log(`🚀 [${requestId}] RFID Scan received: ${logsDto.data?.length || 0} RFID(s)`);
    
    if (!logsDto?.data?.length) {
      this.logger.warn(`⚠️ [${requestId}] No RFID data in request`);
      return [];
    }

    // ⚡ STEP 1: Get scanner (cached)
    const scanner = await this.getScannerCached(this.unitsRepo.manager, scannerCode);
    if (!scanner) {
      this.logger.warn(`Scanner not found: ${scannerCode}`);
      return [];
    }

    // ⚡ STEP 2: Process RFID events IMMEDIATELY (outside transaction)
    const immediateNotifications: Array<{
      rfid: string;
      timestamp: Date;
    }> = [];
    const alreadyNotifiedRfids = new Set<string>();

    if (scanner.scannerType === "REGISTRATION") {
      for (const log of logsDto.data) {
        const rfid = String(log.rfid);
        const unit = await this.getUnitCached(this.unitsRepo.manager, rfid);
        
        if (!unit) {
          immediateNotifications.push({
            rfid,
            timestamp: log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp || Date.now())
          });
          alreadyNotifiedRfids.add(rfid);
          
          // ⚡ Send URGENT notification IMMEDIATELY (fire-and-forget)
          this.logger.log(`📤 [${requestId}] Sending urgent notification for RFID: ${rfid} (BEFORE database save)`);
          this.pusherService.sendRegistrationUrgent({
            rfid,
            scannerCode,
            timestamp: new Date(),
            location: scanner.location,
            employeeUser: scanner.assignedEmployeeUser,
            _immediate: true,
            _sentAt: Date.now()
          })
          .then((latency) => {
            this.logger.log(`✅ [${requestId}] Notification sent for ${rfid}: ${latency}ms`);
          })
          .catch(err => {
            this.logger.error(`❌ [${requestId}] Notification failed for ${rfid}: ${err.message}`);
          });
        }
      }
    }

    // ⚡ STEP 3: Process database operations in transaction
    this.logger.log(`💾 [${requestId}] Attempting database save for ${logsDto.data.length} RFID(s)`);
    const result = await this.unitsRepo.manager.transaction(async (entityManager) => {
      const unitLogs: UnitLogs[] = [];
      const registerEvents: Array<{
        rfid: string;
        scannerCode: string;
        employeeUser: EmployeeUsers;
        location: Locations;
        timestamp: Date;
      }> = [];
      const locationUpdatedRfids = new Set<string>();
  
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
          // For REGISTRATION scanner: Create the unit if it doesn't exist
          if (scanner.scannerType === "REGISTRATION") {
            // Validate scanner has required fields before creating unit
            if (!scanner.status || !scanner.location || !scanner.assignedEmployeeUser) {
              this.logger.error(`Cannot create unit for RFID ${rfid}: Scanner missing required fields (status: ${!!scanner.status}, location: ${!!scanner.location}, employee: ${!!scanner.assignedEmployeeUser})`);
              // Add to registerEvents anyway for notification (unit creation will happen later via web interface)
              registerEvents.push({
                rfid,
                scannerCode,
                timestamp: log.timestamp,
                employeeUser: scanner.assignedEmployeeUser,
                location: scanner.location,
              });
              continue;
            }
            
            this.logger.debug(`Creating new unit for RFID: ${rfid} via registration scanner`);
            
            try {
              // Get a default model (use first available model)
              const models = await entityManager.find(Model, {
                order: { modelId: 'ASC' },
                take: 1,
              });
              const defaultModel = models.length > 0 ? models[0] : null;
              
              if (!defaultModel) {
                this.logger.error(`No models found in database. Cannot create unit for RFID: ${rfid}`);
                // Add to registerEvents for notification (unit creation will happen later via web interface)
                registerEvents.push({
                  rfid,
                  scannerCode,
                  timestamp: log.timestamp,
                  employeeUser: scanner.assignedEmployeeUser,
                  location: scanner.location,
                });
                continue;
              }
              
              // Create the unit within the existing transaction
              const newUnit = new Units();
              newUnit.rfid = rfid;
              newUnit.chassisNo = `CH-${rfid}`;
              newUnit.color = "Auto-Registered";
              newUnit.description = `Auto-registered at ${scanner.location.name || 'Registration Area'}`;
              newUnit.dateCreated = new Date();
              newUnit.status = scanner.status;
              newUnit.location = scanner.location;
              newUnit.createdBy = scanner.assignedEmployeeUser;
              newUnit.model = defaultModel; // ⚠️ CRITICAL: Set model to satisfy NOT NULL constraint
              
              // Save unit within transaction
              const savedUnit = await entityManager.save(Units, newUnit);
              
              // Generate unit code
              savedUnit.unitCode = `U-${generateIndentityCode(savedUnit.unitId)}`;
              await entityManager.save(Units, savedUnit);
              
              this.logger.debug(`Unit created successfully: ${savedUnit.unitCode} for RFID: ${rfid}`);
              
              // Update unitMemo with the newly created unit
              unitMemo.set(rfid, savedUnit);
              unit = savedUnit;
              
              // Add to registerEvents for Pusher notification
              registerEvents.push({
                rfid,
                scannerCode,
                timestamp: log.timestamp,
                employeeUser: scanner.assignedEmployeeUser,
                location: scanner.location,
              });
              
              // Continue to create UnitLog for this newly registered unit
              // (don't continue/break here - let it create the log below)
            } catch (error) {
              this.logger.error(`Failed to create unit for RFID ${rfid}: ${error.message}`, error.stack);
              // Add to registerEvents for notification even if creation failed
              registerEvents.push({
                rfid,
                scannerCode,
                timestamp: log.timestamp,
                employeeUser: scanner.assignedEmployeeUser,
                location: scanner.location,
              });
              // Skip this RFID if unit creation failed
              continue;
            }
          } else {
            // Location scanner scanned unregistered RFID - log error and skip
            this.logger.error(`Location scanner "${scanner.name}" (${scannerCode}) scanned unregistered RFID: ${rfid}`);
            continue;
          }
        }
  
        if (scanner.scannerType === "LOCATION") {
          try {
            this.logger.debug(`Calling updateUnitLocation() for location scanner...`);
            const locationUpdateResult = await this.updateUnitLocation(rfid, scannerCode);
            this.logger.debug(`updateUnitLocation() success - Pusher triggered automatically`);
            
            const unitCacheKey = this.keyUnit(rfid);
            const lastLogCacheKey = this.keyLastLog(rfid);
            this.cacheService.del(unitCacheKey);
            this.cacheService.del(lastLogCacheKey);
            
            unitMemo.set(rfid, locationUpdateResult.unit);
            locationUpdatedRfids.add(rfid);
            
            continue;
          } catch (error) {
            this.logger.error(`updateUnitLocation() failed: ${error.message}`, error.stack);
            continue;
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
        new Set(unitLogs.map((l) => l.unit.rfid).filter(rfid => !locationUpdatedRfids.has(rfid)))
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
        
        // Get full unit data for each RFID to include in event
        const unitDataPromises = result.rfidsToNotify.map(async (rfid: string) => {
          const unit = await this.unitsRepo.findOne({
            where: { rfid, active: true },
            relations: ["model", "location", "status"]
          });
          
          if (unit) {
            return {
              rfid,
              unit: {
                unitId: unit.unitId,
                unitCode: unit.unitCode,
                rfid: unit.rfid,
                chassisNo: unit.chassisNo,
                color: unit.color,
                description: unit.description,
                model: unit.model ? {
                  modelId: unit.model.modelId,
                  modelName: (unit.model as any).modelName || (unit.model as any).name
                } : null,
                location: unit.location ? {
                  locationId: unit.location.locationId,
                  name: unit.location.name
                } : null,
                status: unit.status ? {
                  statusId: unit.status.statusId,
                  name: unit.status.name
                } : null
              }
            };
          }
          return { rfid, unit: null };
        });
        
        const unitsData = await Promise.all(unitDataPromises);
        
        unitsData.forEach(({ rfid, unit: unitData }) => {
          this.pusherService.reSync('units', {
            rfid: rfid,
            action: 'LOCATION_UPDATED',
            timestamp: new Date(),
            _autoRefresh: true, // Frontend should auto-refresh unit tracker table
            _noToast: true, // Don't show toast for location updates (already registered)
            unit: unitData // Include full unit data for table update
          }, true); // ⚡ Urgent flag for RFID events
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
            this.logger.debug(`⚡ Sending registration event for RFID: ${e.rfid}, Employee: ${e.employeeUser?.employeeUserCode}`);
            
            const unitCacheKey = this.keyUnit(e.rfid);
            this.cacheService.del(unitCacheKey);
            
            // ⚡ Use ONLY emergency channel for RFID registration events (no duplicates)
            const rfidData = {
              rfid: e.rfid,
              scannerCode: e.scannerCode,
              location: e.location?.name,
              locationId: e.location?.locationId,
              action: 'RFID_DETECTED',
              status: scanner?.status?.name || 'FOR DELIVERY',
              statusId: scanner?.status?.statusId,
              employeeUserCode: e.employeeUser?.employeeUserCode,
              timestamp: e.timestamp instanceof Date ? e.timestamp : new Date(e.timestamp || Date.now()),
              _autoDisplay: true, // Frontend should auto-display CBU form
              _noToast: false // Show notification for new RFID detection
            };

            // ⚡ Single channel for RFID events
            this.pusherService.sendRegistrationUrgent(rfidData).catch(err => {
              this.logger.error(`Failed to send RFID registration event: ${err.message}`);
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
  
      const totalTime = Date.now() - processStart;
      this.logger.log(`✅ [${requestId}] Database saved: ${totalTime}ms, ${immediateNotifications.length} immediate notifications, ${result?.unitLogs?.length || 0} unit logs created`);
      
      return result.unitLogs;
    }

    const totalTime = Date.now() - processStart;
    this.logger.log(`✅ [${requestId}] Processing complete: ${totalTime}ms, ${immediateNotifications.length} immediate notifications, 0 in transaction`);
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