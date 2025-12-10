import { CreateUnitDto } from "src/core/dto/unit/unit.create.dto";
import { UpdateUnitDto } from "src/core/dto/unit/unit.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Units } from "src/db/entities/Units";
import { UnitsService } from "src/services/units.service";
import { LogsDto } from "src/core/dto/unit/unit-logs.dto";
import { UnitLogs } from "src/db/entities/UnitLogs";
export declare class UnitsController {
    private readonly unitsService;
    constructor(unitsService: UnitsService);
    getActivityHistory(unitCode: string, pageSize?: string, pageIndex?: string): Promise<ApiResponseModel<{
        results: UnitLogs[];
        total: number;
    }>>;
    getByCode(unitCode: string): Promise<ApiResponseModel<Units>>;
    getPaginated(params: {
        pageSize: string;
        pageIndex: string;
        order: any;
        columnDef: any[];
    }): Promise<ApiResponseModel<{
        results: Units[];
        total: number;
    }>>;
    create(accessDto: CreateUnitDto, userId: string): Promise<ApiResponseModel<Units>>;
    update(unitCode: string, dto: UpdateUnitDto, userId: string): Promise<ApiResponseModel<Units>>;
    delete(unitCode: string, userId: string): Promise<ApiResponseModel<Units>>;
    unitLogs(dto: LogsDto, req: any): Promise<ApiResponseModel<UnitLogs[]>>;
    registerUnit(dto: {
        scannerCode: string;
        rfid: string;
        chassisNo?: string;
        color?: string;
        description?: string;
        modelId?: string;
    }): Promise<ApiResponseModel<any>>;
    updateUnitLocation(dto: {
        scannerCode: string;
        rfid: string;
    }): Promise<ApiResponseModel<any>>;
}
