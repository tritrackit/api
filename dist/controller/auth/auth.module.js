"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../../services/auth.service");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const auth_controller_1 = require("./auth.controller");
const typeorm_1 = require("@nestjs/typeorm");
const email_service_1 = require("../../services/email.service");
const EmployeeUsers_1 = require("../../db/entities/EmployeeUsers");
const jwt_strategy_1 = require("../../core/auth/jwt.strategy");
const employee_user_module_1 = require("../employee-user/employee-user.module");
const refresh_token_strategy_1 = require("../../core/auth/refresh-token.strategy");
const api_key_scanner_guard_1 = require("../../core/auth/api-key-scanner.guard");
const scanner_service_1 = require("../../services/scanner.service");
const Scanner_1 = require("../../db/entities/Scanner");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            employee_user_module_1.EmployeeUserModule,
            passport_1.PassportModule.register({}),
            jwt_1.JwtModule.register({}),
            typeorm_1.TypeOrmModule.forFeature([EmployeeUsers_1.EmployeeUsers, Scanner_1.Scanner]),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [
            auth_service_1.AuthService,
            email_service_1.EmailService,
            jwt_strategy_1.JwtStrategy,
            refresh_token_strategy_1.RefreshTokenStrategy,
            scanner_service_1.ScannerService,
            api_key_scanner_guard_1.ApiKeyScannerGuard
        ],
        exports: [auth_service_1.AuthService, email_service_1.EmailService],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map