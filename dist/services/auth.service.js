"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const utils_1 = require("../common/utils/utils");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const auth_error_constant_1 = require("../common/constant/auth-error.constant");
const config_1 = require("@nestjs/config");
const email_service_1 = require("./email.service");
const EmployeeUsers_1 = require("../db/entities/EmployeeUsers");
const cache_constant_1 = require("../common/constant/cache.constant");
const cache_service_1 = require("./cache.service");
let AuthService = class AuthService {
    constructor(employeeUserRepo, emailService, jwtService, config, cacheService) {
        this.employeeUserRepo = employeeUserRepo;
        this.emailService = emailService;
        this.jwtService = jwtService;
        this.config = config;
        this.cacheService = cacheService;
    }
    async login({ userName, password }) {
        try {
            const key = cache_constant_1.CacheKeys.employeeUsers.byUserName(userName);
            let employeeUser = this.cacheService.get(key);
            if (!employeeUser) {
                employeeUser = await this.employeeUserRepo.findOne({
                    where: {
                        userName,
                        active: true,
                    },
                    relations: {
                        role: true,
                        createdBy: true,
                        updatedBy: true,
                    },
                });
                this.cacheService.set(key, employeeUser);
            }
            if (!employeeUser) {
                throw Error(auth_error_constant_1.LOGIN_ERROR_USER_NOT_FOUND);
            }
            const passwordMatch = await (0, utils_1.compare)(employeeUser.password, password);
            if (!passwordMatch) {
                throw Error(auth_error_constant_1.LOGIN_ERROR_PASSWORD_INCORRECT);
            }
            if (!employeeUser.accessGranted) {
                throw Error(auth_error_constant_1.LOGIN_ERROR_PENDING_ACCESS_REQUEST);
            }
            const { accessToken, refreshToken } = await this.issueTokens(employeeUser.employeeUserId, employeeUser.email);
            const response = Object.assign(Object.assign({}, employeeUser), { accessToken,
                refreshToken });
            delete response.password;
            delete response.invitationCode;
            return response;
        }
        catch (ex) {
            throw ex;
        }
    }
    async verify({ email, hashCode }) {
        try {
            const key = cache_constant_1.CacheKeys.employeeUsers.byEmail(email);
            let employeeUser = this.cacheService.get(key);
            if (!employeeUser) {
                employeeUser = await this.employeeUserRepo.findOne({
                    where: {
                        email,
                        active: true,
                    },
                    relations: {
                        role: true,
                        createdBy: true,
                        updatedBy: true,
                    },
                });
                this.cacheService.set(key, employeeUser);
            }
            if (!employeeUser) {
                throw Error(auth_error_constant_1.LOGIN_ERROR_USER_NOT_FOUND);
            }
            if (employeeUser.accessGranted) {
                throw Error("The user has already been granted role!");
            }
            const codeMatch = await (0, utils_1.compare)(hashCode, employeeUser.invitationCode);
            if (!codeMatch) {
                throw Error(auth_error_constant_1.VERFICATION_ERROR_CODE_INCORRECT);
            }
            employeeUser.accessGranted = true;
            await this.employeeUserRepo.save(employeeUser);
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byId(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserId));
            this.cacheService.del(cache_constant_1.CacheKeys.employeeUsers.byCode(employeeUser === null || employeeUser === void 0 ? void 0 : employeeUser.employeeUserCode));
            this.cacheService.delByPrefix(cache_constant_1.CacheKeys.employeeUsers.prefix);
            return employeeUser;
        }
        catch (ex) {
            throw ex;
        }
    }
    async refresh(employeeUserId, refreshToken) {
        const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byId(employeeUserId);
        let employeeUser = this.cacheService.get(employeeUserKey);
        if (!employeeUser) {
            employeeUser = await this.employeeUserRepo.findOne({
                where: {
                    employeeUserId,
                    active: true,
                },
                relations: {
                    role: true,
                    createdBy: true,
                    updatedBy: true,
                    pictureFile: true,
                },
            });
            this.cacheService.set(employeeUserKey, employeeUser);
        }
        if (!employeeUser || employeeUser.refreshToken !== refreshToken) {
            throw new common_1.ForbiddenException("Invalid token");
        }
        return await this.issueTokens(employeeUser.employeeUserId, employeeUser.email);
    }
    async issueTokens(employeeUserId, email) {
        const accessToken = this.jwtService.sign({ sub: employeeUserId, email }, { secret: this.config.get("ACCESS_SECRET"), expiresIn: "15m" });
        const refreshToken = this.jwtService.sign({ sub: employeeUserId }, { secret: this.config.get("REFRESH_SECRET"), expiresIn: "7d" });
        const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byId(employeeUserId);
        let employeeUser = this.cacheService.get(employeeUserKey);
        if (!employeeUser) {
            employeeUser = await this.employeeUserRepo.findOne({
                where: {
                    employeeUserId,
                    active: true,
                },
                relations: {
                    role: true,
                    createdBy: true,
                    updatedBy: true,
                    pictureFile: true,
                },
            });
            this.cacheService.set(employeeUserKey, employeeUser);
        }
        if (!employeeUser) {
            throw new common_1.ForbiddenException("User not found");
        }
        employeeUser.updatedBy = employeeUser;
        employeeUser.lastUpdatedAt = await (0, utils_1.getDate)();
        employeeUser.refreshToken = refreshToken;
        await this.employeeUserRepo.save(employeeUser);
        return { accessToken, refreshToken };
    }
    async getNewAccessAndRefreshToken(refreshToken, employeeUserId) {
        const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byToken(employeeUserId, refreshToken);
        let employeeUser = this.cacheService.get(employeeUserKey);
        if (!employeeUser) {
            employeeUser = await this.employeeUserRepo.findOne({
                where: {
                    refreshToken,
                    employeeUserId,
                    active: true,
                },
                relations: {
                    role: true,
                    createdBy: true,
                    updatedBy: true,
                    pictureFile: true,
                },
            });
            this.cacheService.set(employeeUserKey, employeeUser);
        }
        if (!employeeUser) {
            throw new common_1.ForbiddenException("Invalid token");
        }
        return await this.issueTokens(employeeUser.employeeUserId, employeeUser.email);
    }
    async logOut(employeeUserId) {
        const employeeUserKey = cache_constant_1.CacheKeys.employeeUsers.byId(employeeUserId);
        let employeeUser = this.cacheService.get(employeeUserKey);
        if (!employeeUser) {
            employeeUser = await this.employeeUserRepo.findOne({
                where: {
                    employeeUserId,
                    active: true,
                },
                relations: {
                    role: true,
                    createdBy: true,
                    updatedBy: true,
                    pictureFile: true,
                },
            });
            this.cacheService.set(employeeUserKey, employeeUser);
        }
        if (employeeUser) {
            employeeUser.refreshToken = null;
            await this.employeeUserRepo.save(employeeUser);
        }
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(EmployeeUsers_1.EmployeeUsers)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        email_service_1.EmailService,
        jwt_1.JwtService,
        config_1.ConfigService,
        cache_service_1.CacheService])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map