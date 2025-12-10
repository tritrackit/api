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
exports.StatisticsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const statistics_service_1 = require("../../services/statistics.service");
const jwt_auth_guard_1 = require("../../core/auth/jwt-auth.guard");
const statistics_dto_1 = require("../../core/dto/statistics/statistics.dto");
const statistics_dto_2 = require("../../core/dto/statistics/statistics.dto");
let StatisticsController = class StatisticsController {
    constructor(statisticsService) {
        this.statisticsService = statisticsService;
    }
    async getDashboardData(filters) {
        var _a;
        const res = {};
        try {
            if (!filters.timeframe) {
                filters.timeframe = { type: statistics_dto_2.TimeframeType.DAILY };
            }
            const dashboardFilters = Object.assign(Object.assign({}, filters), { timeframe: Object.assign(Object.assign({}, filters.timeframe), { type: ((_a = filters.timeframe) === null || _a === void 0 ? void 0 : _a.type) || statistics_dto_2.TimeframeType.DAILY }) });
            res.data = await this.statisticsService.getDashboardData(dashboardFilters);
            res.success = true;
            res.message = "Dashboard data retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getTodayDashboard() {
        const res = {};
        try {
            const filters = {
                timeframe: {
                    type: statistics_dto_2.TimeframeType.DAILY
                }
            };
            res.data = await this.statisticsService.getDashboardData(filters);
            res.success = true;
            res.message = "Today's dashboard data retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getMonthlyReport(filters) {
        var _a;
        const res = {};
        try {
            if (!filters.timeframe) {
                filters.timeframe = { type: statistics_dto_2.TimeframeType.MONTHLY };
            }
            const reportFilters = Object.assign(Object.assign({}, filters), { timeframe: Object.assign(Object.assign({}, filters.timeframe), { type: ((_a = filters.timeframe) === null || _a === void 0 ? void 0 : _a.type) || statistics_dto_2.TimeframeType.MONTHLY }) });
            res.data = await this.statisticsService.getProductionReport(reportFilters);
            res.success = true;
            res.message = "Monthly report retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getCurrentMonthReport() {
        const res = {};
        try {
            const filters = {
                timeframe: {
                    type: statistics_dto_2.TimeframeType.MONTHLY
                }
            };
            res.data = await this.statisticsService.getProductionReport(filters);
            res.success = true;
            res.message = "Current month report retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getCustomReport(filters) {
        const res = {};
        try {
            if (!filters.timeframe) {
                throw new common_1.HttpException("Timeframe is required for custom reports", common_1.HttpStatus.BAD_REQUEST);
            }
            res.data = await this.statisticsService.getProductionReport(filters);
            res.success = true;
            res.message = "Custom report retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getCurrentWeekDashboard() {
        const res = {};
        try {
            const filters = {
                timeframe: {
                    type: statistics_dto_2.TimeframeType.WEEKLY
                }
            };
            res.data = await this.statisticsService.getDashboardData(filters);
            res.success = true;
            res.message = "Current week dashboard data retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
    async getCurrentYearDashboard() {
        const res = {};
        try {
            const filters = {
                timeframe: {
                    type: statistics_dto_2.TimeframeType.YEARLY
                }
            };
            res.data = await this.statisticsService.getDashboardData(filters);
            res.success = true;
            res.message = "Current year dashboard data retrieved successfully";
            return res;
        }
        catch (e) {
            res.success = false;
            if (e instanceof common_1.HttpException) {
                throw e;
            }
            res.message = e.message !== undefined ? e.message : String(e);
            return res;
        }
    }
};
__decorate([
    (0, common_1.Post)("dashboard"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({ type: statistics_dto_1.StatisticsFilterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [statistics_dto_1.StatisticsFilterDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getDashboardData", null);
__decorate([
    (0, common_1.Get)("dashboard/today"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getTodayDashboard", null);
__decorate([
    (0, common_1.Post)("reports/monthly"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({ type: statistics_dto_1.StatisticsFilterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [statistics_dto_1.StatisticsFilterDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getMonthlyReport", null);
__decorate([
    (0, common_1.Get)("reports/current-month"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getCurrentMonthReport", null);
__decorate([
    (0, common_1.Post)("reports/custom"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({ type: statistics_dto_1.StatisticsFilterDto }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [statistics_dto_1.StatisticsFilterDto]),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getCustomReport", null);
__decorate([
    (0, common_1.Get)("dashboard/current-week"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getCurrentWeekDashboard", null);
__decorate([
    (0, common_1.Get)("dashboard/current-year"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StatisticsController.prototype, "getCurrentYearDashboard", null);
StatisticsController = __decorate([
    (0, swagger_1.ApiTags)("statistics"),
    (0, common_1.Controller)("statistics"),
    (0, swagger_1.ApiBearerAuth)("jwt"),
    __metadata("design:paramtypes", [statistics_service_1.StatisticsService])
], StatisticsController);
exports.StatisticsController = StatisticsController;
//# sourceMappingURL=statistics.controller.js.map