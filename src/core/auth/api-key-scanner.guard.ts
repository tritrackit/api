// src/core/auth/api-key-scanner.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ScannerService } from "src/services/scanner.service";

@Injectable()
export class ApiKeyScannerGuard implements CanActivate {
  constructor(private readonly scannerService: ScannerService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest();
    const apiKey =
      (req.headers["x-api-key"] as string) || (req.query["api_key"] as string);

    if (!apiKey) throw new UnauthorizedException("Missing API key");

    const scanner = await this.scannerService.getByCode(apiKey);

    if (!scanner) throw new UnauthorizedException("Invalid API key");

    req.scanner = {
      id: scanner.scannerId,
      code: scanner.scannerCode,
      locationId: scanner["locationId"],
    };
    return true;
  }
}
