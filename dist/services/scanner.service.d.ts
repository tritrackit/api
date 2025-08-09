import { CreateScannerDto } from "src/core/dto/scanner/scanner.create.dto";
import { UpdateScannerDto } from "src/core/dto/scanner/scanner.update.dto";
import { Scanner } from "src/db/entities/Scanner";
import { Repository } from "typeorm";
export declare class ScannerService {
    private readonly scannerRepo;
    constructor(scannerRepo: Repository<Scanner>);
    getPagination({ pageSize, pageIndex, order, columnDef }: {
        pageSize: any;
        pageIndex: any;
        order: any;
        columnDef: any;
    }): Promise<{
        results: Scanner[];
        total: number;
    }>;
    getById(scannerId: any): Promise<Scanner>;
    create(dto: CreateScannerDto, createdByUserId: string): Promise<Scanner>;
    update(scannerCode: any, dto: UpdateScannerDto, updatedByUserId: string): Promise<Scanner>;
    delete(scannerCode: any, updatedByUserId: string): Promise<Scanner>;
}
