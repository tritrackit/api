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

@Module({
  imports: [
    EmployeeUserModule,
    PassportModule.register({}), // ok with no default
    JwtModule.register({}),
    TypeOrmModule.forFeature([EmployeeUsers]),
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtStrategy, RefreshTokenStrategy],
  exports: [AuthService, EmailService],
})
export class AuthModule {}
