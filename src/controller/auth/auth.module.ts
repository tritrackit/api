import { Module } from "@nestjs/common";
import { AuthService } from "../../services/auth.service";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmailService } from "src/services/email.service";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { JwtStrategy } from "../../core/auth/jwt.strategy";
import { EmployeeUserModule } from "../employee-user/employee-user.module";
import { RefreshTokenStrategy } from "src/core/auth/refresh-token.strategy";
import { ApiKeyScannerGuard } from "src/core/auth/api-key-scanner.guard";
import { ScannerService } from "src/services/scanner.service";
import { Scanner } from "src/db/entities/Scanner";

@Module({
  imports: [
    EmployeeUserModule,
    PassportModule.register({}), // ok with no default
    JwtModule.register({}),
    TypeOrmModule.forFeature([EmployeeUsers, Scanner]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    JwtStrategy,
    RefreshTokenStrategy,
    ScannerService,
    ApiKeyScannerGuard
  ],
  exports: [AuthService, EmailService],
})
export class AuthModule {}
