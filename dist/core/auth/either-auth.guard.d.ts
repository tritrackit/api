import { CanActivate, ExecutionContext } from "@nestjs/common";
import { ApiKeyScannerGuard } from "./api-key-scanner.guard";
export declare class EitherAuthGuard implements CanActivate {
    private apiKeyGuard;
    private jwt;
    constructor(apiKeyGuard: ApiKeyScannerGuard);
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
