import { CanActivate, ExecutionContext } from "@nestjs/common";
import { ScannerService } from "src/services/scanner.service";
export declare class ApiKeyScannerGuard implements CanActivate {
    private readonly scannerService;
    constructor(scannerService: ScannerService);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
