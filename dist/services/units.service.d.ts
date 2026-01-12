import { LogsDto } from "./../core/dto/unit/unit-logs.dto";
import { Locations } from "src/db/entities/Locations";
import { CreateUnitDto } from "src/core/dto/unit/unit.create.dto";
import { UpdateUnitDto } from "src/core/dto/unit/unit.update.dto";
import { Units } from "src/db/entities/Units";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { Repository } from "typeorm";
import { UnitLogs } from "src/db/entities/UnitLogs";
import { PusherService } from "./pusher.service";
import { CacheService } from "./cache.service";
export declare class UnitsService {
    private readonly unitsRepo;
    private pusherService;
    private readonly cacheService;
    private readonly logger;
    private readonly recentNotifications;
    private readonly NOTIFICATION_COOLDOWN_MS;
    private cleanupInterval;
    constructor(unitsRepo: Repository<Units>, pusherService: PusherService, cacheService: CacheService);
    private startNotificationCleanup;
    onModuleDestroy(): void;
    getPagination({ pageSize, pageIndex, order, columnDef }: {
        pageSize: any;
        pageIndex: any;
        order: any;
        columnDef: any;
    }): Promise<{
        results: Units[];
        total: number;
    }>;
    getByCode(unitCode: any): Promise<Units>;
    create(dto: CreateUnitDto, createdByUserId: string): Promise<Units>;
    private cleanUnitResponse;
    private cleanEmployeeUser;
    private cleanLocation;
    private cleanLocationUpdateResponse;
    private createWithScannerStatus;
    registerUnitUltraFast(rfid: string, scannerCode: string, additionalData?: {
        chassisNo?: string;
        color?: string;
        description?: string;
        modelId?: string;
    }): Promise<any>;
    private sendPredictiveNotification;
    private executeMinimalTransaction;
    private updateExistingUnitToDelivered;
    private clearCacheImmediately;
    private sendConfirmedNotificationAsync;
    private handleAsyncPostRegistration;
    private sendRegistrationFailed;
    registerUnit(rfid: string, scannerCode: string, additionalData?: {
        chassisNo?: string;
        color?: string;
        description?: string;
        modelId?: string;
    }): Promise<any>;
    updateUnitLocation(rfid: string, scannerCode: string): Promise<any>;
    update(unitCode: any, dto: UpdateUnitDto, updatedByUserId: string): Promise<Units>;
    delete(unitCode: any, updatedByUserId: string): Promise<Units>;
    private keyScanner;
    private keyUnit;
    private keyLastLog;
    private getScannerCached;
    private getUnitCached;
    private getLastLogCached;
    unitLogs(logsDto: LogsDto, scannerCode: string): Promise<UnitLogs[] | ({
        unitLogs: UnitLogs[];
        rfidsToNotify: string[];
        registerEvents: {
            rfid: string;
            scannerCode: string;
            employeeUser: EmployeeUsers;
            location: Locations;
            timestamp: Date;
        }[];
    } & any[])>;
    getActivityHistory(unitCode: string, pageSize?: number, pageIndex?: number): Promise<{
        results: UnitLogs[];
        total: number;
    }>;
}
