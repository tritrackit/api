import { LogsDto } from "./../core/dto/unit/unit-logs.dto";
import { CreateUnitDto } from "src/core/dto/unit/unit.create.dto";
import { UpdateUnitDto } from "src/core/dto/unit/unit.update.dto";
import { Units } from "src/db/entities/Units";
import { Repository } from "typeorm";
import { UnitLogs } from "src/db/entities/UnitLogs";
import { PusherService } from "./pusher.service";
export declare class UnitsService {
    private readonly unitsRepo;
    private pusherService;
    constructor(unitsRepo: Repository<Units>, pusherService: PusherService);
    getPagination({ pageSize, pageIndex, order, columnDef }: {
        pageSize: any;
        pageIndex: any;
        order: any;
        columnDef: any;
    }): Promise<{
        results: Units[];
        total: number;
    }>;
    getById(unitId: any): Promise<Units>;
    create(dto: CreateUnitDto, createdByUserId: string): Promise<Units>;
    update(unitCode: any, dto: UpdateUnitDto, updatedByUserId: string): Promise<Units>;
    unitLogs(logsDto: LogsDto): Promise<UnitLogs[]>;
    delete(unitCode: any, updatedByUserId: string): Promise<Units>;
}
