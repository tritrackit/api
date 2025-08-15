import { CreateScannerDto } from "src/core/dto/scanner/scanner.create.dto";
import { UpdateScannerDto } from "src/core/dto/scanner/scanner.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Scanner } from "src/db/entities/Scanner";
import { ScannerService } from "src/services/scanner.service";
export declare class ScannerController {
    private readonly scannerService;
    constructor(scannerService: ScannerService);
    getByCode(scannerCode: string): Promise<ApiResponseModel<Scanner>>;
    getPaginated(params?: {
        pageSize: string;
        pageIndex: string;
        order: any;
        columnDef: any[];
    }): Promise<ApiResponseModel<{
        results: Scanner[];
        total: number;
    }>>;
    create(accessDto: CreateScannerDto, userId: string): Promise<ApiResponseModel<Scanner>>;
    update(scannerId: string, dto: UpdateScannerDto, userId: string): Promise<ApiResponseModel<Scanner>>;
    delete(scannerId: string, userId: string): Promise<ApiResponseModel<Scanner>>;
}
