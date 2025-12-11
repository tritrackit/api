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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatisticsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const Units_1 = require("../db/entities/Units");
const Locations_1 = require("../db/entities/Locations");
const Status_1 = require("../db/entities/Status");
const Model_1 = require("../db/entities/Model");
const statistics_dto_1 = require("../core/dto/statistics/statistics.dto");
const status_constants_1 = require("../common/constant/status.constants");
const moment_1 = __importDefault(require("moment"));
let StatisticsService = class StatisticsService {
    constructor(unitsRepo, locationsRepo, statusRepo, modelRepo) {
        this.unitsRepo = unitsRepo;
        this.locationsRepo = locationsRepo;
        this.statusRepo = statusRepo;
        this.modelRepo = modelRepo;
    }
    getDateRange(timeframe) {
        const { type, startDate, endDate } = timeframe;
        let dateFrom;
        let dateTo;
        if (startDate && endDate) {
            dateFrom = (0, moment_1.default)(startDate).startOf('day').toDate();
            dateTo = (0, moment_1.default)(endDate).endOf('day').toDate();
            if (dateFrom > dateTo) {
                throw new common_1.HttpException('Start date must be before or equal to end date', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        else {
            const now = (0, moment_1.default)();
            switch (type) {
                case statistics_dto_1.TimeframeType.DAILY:
                    dateFrom = now.startOf('day').toDate();
                    dateTo = now.endOf('day').toDate();
                    break;
                case statistics_dto_1.TimeframeType.WEEKLY:
                    dateFrom = now.startOf('isoWeek').toDate();
                    dateTo = now.endOf('isoWeek').toDate();
                    break;
                case statistics_dto_1.TimeframeType.MONTHLY:
                    dateFrom = now.startOf('month').toDate();
                    dateTo = now.endOf('month').toDate();
                    break;
                case statistics_dto_1.TimeframeType.QUARTERLY:
                    dateFrom = now.startOf('quarter').toDate();
                    dateTo = now.endOf('quarter').toDate();
                    break;
                case statistics_dto_1.TimeframeType.YEARLY:
                    dateFrom = now.startOf('year').toDate();
                    dateTo = now.endOf('year').toDate();
                    break;
                default:
                    dateFrom = now.startOf('day').toDate();
                    dateTo = now.endOf('day').toDate();
            }
        }
        return { dateFrom, dateTo };
    }
    async getDashboardData(filters) {
        var _a;
        try {
            const { dateFrom, dateTo } = this.getDateRange(filters.timeframe);
            const totalUnits = await this.unitsRepo.count({
                where: { active: true }
            });
            let unitsInStorage = 0;
            const storageStatus = await this.statusRepo.findOne({
                where: { statusId: status_constants_1.STATUS.STORAGE.toString() },
                select: ['statusId', 'name']
            });
            if (!storageStatus) {
                unitsInStorage = 0;
            }
            else {
                const hasValidLocationFilter = ((_a = filters.locationIds) === null || _a === void 0 ? void 0 : _a.length) &&
                    filters.locationIds.some(id => id && id !== "string" && id.trim() !== "");
                if (hasValidLocationFilter) {
                    const validLocationIds = filters.locationIds.filter(id => id && id !== "string" && id.trim() !== "");
                    unitsInStorage = await this.unitsRepo
                        .createQueryBuilder('unit')
                        .innerJoin('unit.location', 'location')
                        .innerJoin('unit.status', 'status')
                        .where('unit.active = :active', { active: true })
                        .andWhere('location.locationId IN (:...locationIds)', { locationIds: validLocationIds })
                        .andWhere('location.active = :locationActive', { locationActive: true })
                        .andWhere('status.statusId = :storageStatusId', { storageStatusId: storageStatus.statusId })
                        .getCount();
                }
                else {
                    unitsInStorage = await this.unitsRepo
                        .createQueryBuilder('unit')
                        .innerJoin('unit.status', 'status')
                        .where('unit.active = :active', { active: true })
                        .andWhere('status.statusId = :storageStatusId', { storageStatusId: storageStatus.statusId })
                        .getCount();
                }
            }
            const holdStatus = await this.statusRepo.findOne({ where: { name: 'HOLD' } });
            const unitsOnHold = holdStatus ? await this.unitsRepo.count({
                where: {
                    active: true,
                    status: { statusId: holdStatus.statusId }
                }
            }) : 0;
            const forDeliveryStatus = await this.statusRepo.findOne({ where: { name: 'FOR DELIVERY' } });
            const unitsForDelivery = forDeliveryStatus ? await this.unitsRepo.count({
                where: {
                    active: true,
                    status: { statusId: forDeliveryStatus.statusId }
                }
            }) : 0;
            const filteredUnitsQuery = this.unitsRepo
                .createQueryBuilder('unit')
                .where('unit.active = :active', { active: true })
                .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
            this.applyFilters(filteredUnitsQuery, filters);
            const totalUnitsInTimeframe = await filteredUnitsQuery.getCount();
            const unitsByColorQuery = this.unitsRepo
                .createQueryBuilder('unit')
                .select('unit.color', 'color')
                .addSelect('COUNT(unit.unitId)', 'count')
                .where('unit.active = :active', { active: true })
                .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
            this.applyFilters(unitsByColorQuery, filters);
            const unitsByColor = await unitsByColorQuery
                .groupBy('unit.color')
                .orderBy('count', 'DESC')
                .getRawMany();
            const unitsByModelQuery = this.unitsRepo
                .createQueryBuilder('unit')
                .select('model.modelName', 'modelName')
                .addSelect('COUNT(unit.unitId)', 'count')
                .leftJoin('unit.model', 'model')
                .where('unit.active = :active', { active: true })
                .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
            this.applyFilters(unitsByModelQuery, filters);
            const unitsByModel = await unitsByModelQuery
                .groupBy('model.modelName')
                .orderBy('count', 'DESC')
                .getRawMany();
            const formattedColors = unitsByColor.map(item => ({
                color: item.color || 'Unknown',
                count: parseInt(item.count || '0', 10),
                percentage: totalUnitsInTimeframe > 0 ?
                    ((parseInt(item.count || '0', 10) / totalUnitsInTimeframe) * 100).toFixed(2) + '%' : '0%'
            }));
            const modelLabels = unitsByModel.length > 0
                ? unitsByModel.map(item => item.modelName || 'Unknown')
                : ['No Data'];
            const modelData = unitsByModel.length > 0
                ? unitsByModel.map(item => parseInt(item.count || '0', 10))
                : [0];
            const modelColors = this.generateColors(modelLabels.length);
            const unitsByModelChart = {
                labels: modelLabels,
                datasets: [{
                        label: 'Units Created',
                        data: modelData,
                        backgroundColor: modelColors,
                        borderColor: modelColors.map(c => {
                            if (c.startsWith('#')) {
                                return c;
                            }
                            return c;
                        }),
                        borderWidth: 2
                    }]
            };
            const colorLabels = formattedColors.length > 0
                ? formattedColors.map(item => item.color || 'Unknown')
                : ['No Data'];
            const colorData = formattedColors.length > 0
                ? formattedColors.map(item => item.count)
                : [0];
            const colorChartColors = this.generateColors(colorLabels.length);
            const unitsByColorChart = {
                labels: colorLabels,
                datasets: [{
                        label: 'Units by Color',
                        data: colorData,
                        backgroundColor: colorChartColors,
                        borderColor: colorChartColors.map(c => {
                            if (c.startsWith('#')) {
                                return c;
                            }
                            return c;
                        }),
                        borderWidth: 2
                    }]
            };
            return {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    timeframe: filters.timeframe,
                    filtersApplied: this.getAppliedFilters(filters),
                    dateRange: {
                        from: dateFrom,
                        to: dateTo
                    }
                },
                summary: {
                    totalUnits,
                    unitsInStorage,
                    unitsOnHold,
                    unitsForDelivery,
                    unitsCreatedInPeriod: totalUnitsInTimeframe
                },
                colorDistribution: formattedColors,
                chartData: {
                    unitsByModel: unitsByModelChart,
                    unitsByColor: unitsByColorChart
                }
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error retrieving dashboard data: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getProductionReport(filters) {
        try {
            const { dateFrom, dateTo } = this.getDateRange(filters.timeframe);
            const baseQuery = this.unitsRepo
                .createQueryBuilder('unit')
                .leftJoin('unit.status', 'status')
                .where('unit.active = :active', { active: true })
                .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
            this.applyFilters(baseQuery, filters);
            const totalUnitsInPeriod = await baseQuery.getCount();
            const deliveredUnitsQuery = baseQuery.clone();
            const deliveredUnits = await deliveredUnitsQuery
                .andWhere('status.name = :statusName', { statusName: 'DELIVERED' })
                .getCount();
            const unitsByModelQuery = this.unitsRepo
                .createQueryBuilder('unit')
                .select('model.modelName', 'modelname')
                .addSelect('COUNT(unit.unitId)', 'totalunits')
                .addSelect(`SUM(CASE WHEN status.name = 'DELIVERED' THEN 1 ELSE 0 END)`, 'deliveredunits')
                .leftJoin('unit.model', 'model')
                .leftJoin('unit.status', 'status')
                .where('unit.active = :active', { active: true })
                .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
            this.applyFilters(unitsByModelQuery, filters);
            const unitsByModelRaw = await unitsByModelQuery
                .groupBy('model.modelName')
                .orderBy('COUNT(unit.unitId)', 'DESC')
                .getRawMany();
            const unitsByColorQuery = this.unitsRepo
                .createQueryBuilder('unit')
                .select('unit.color', 'color')
                .addSelect('COUNT(unit.unitId)', 'totalunits')
                .addSelect(`SUM(CASE WHEN status.name = 'DELIVERED' THEN 1 ELSE 0 END)`, 'deliveredunits')
                .leftJoin('unit.status', 'status')
                .where('unit.active = :active', { active: true })
                .andWhere('unit.dateCreated BETWEEN :dateFrom AND :dateTo', { dateFrom, dateTo });
            this.applyFilters(unitsByColorQuery, filters);
            const unitsByColorRaw = await unitsByColorQuery
                .groupBy('unit.color')
                .orderBy('COUNT(unit.unitId)', 'DESC')
                .getRawMany();
            const deliveryRate = totalUnitsInPeriod > 0 ?
                ((deliveredUnits / totalUnitsInPeriod) * 100).toFixed(2) + '%' : '0%';
            const periodDisplay = `${(0, moment_1.default)(dateFrom).format('MMM D, YYYY')} - ${(0, moment_1.default)(dateTo).format('MMM D, YYYY')}`.toUpperCase();
            const modelReportLabels = unitsByModelRaw.length > 0
                ? unitsByModelRaw.map(item => item.modelname || 'Unknown')
                : ['No Data'];
            const modelReportData = unitsByModelRaw.length > 0
                ? unitsByModelRaw.map(item => parseInt(item.totalunits || '0', 10))
                : [0];
            const filteredUnitsByModelChart = {
                labels: modelReportLabels,
                datasets: [{
                        label: 'Total Units',
                        data: modelReportData,
                        backgroundColor: this.generateColors(modelReportLabels.length),
                        borderColor: this.generateColors(modelReportLabels.length),
                        borderWidth: 2
                    }]
            };
            const totalVsDeliveredChart = {
                labels: ['Total Units Created', 'Units Delivered'],
                datasets: [{
                        label: 'Units',
                        data: [totalUnitsInPeriod, deliveredUnits],
                        backgroundColor: ['#FF9800', '#2196F3'],
                        borderColor: ['#F57C00', '#1976D2'],
                        borderWidth: 2
                    }]
            };
            const modelTotalData = unitsByModelRaw.length > 0
                ? unitsByModelRaw.map(item => parseInt(item.totalunits || '0', 10))
                : [0];
            const modelDeliveredData = unitsByModelRaw.length > 0
                ? unitsByModelRaw.map(item => parseInt(item.deliveredunits || '0', 10))
                : [0];
            const unitsByModelComparisonChart = {
                labels: modelReportLabels,
                datasets: [
                    {
                        label: 'Total Units',
                        data: modelTotalData,
                        backgroundColor: '#FF9800',
                        borderColor: '#F57C00',
                        borderWidth: 2
                    },
                    {
                        label: 'Delivered Units',
                        data: modelDeliveredData,
                        backgroundColor: '#2196F3',
                        borderColor: '#1976D2',
                        borderWidth: 2
                    }
                ]
            };
            const colorComparisonLabels = unitsByColorRaw.length > 0
                ? unitsByColorRaw.map(item => item.color || 'Unknown')
                : ['No Data'];
            const colorTotalData = unitsByColorRaw.length > 0
                ? unitsByColorRaw.map(item => parseInt(item.totalunits || '0', 10))
                : [0];
            const colorDeliveredData = unitsByColorRaw.length > 0
                ? unitsByColorRaw.map(item => parseInt(item.deliveredunits || '0', 10))
                : [0];
            const unitsByColorComparisonChart = {
                labels: colorComparisonLabels,
                datasets: [
                    {
                        label: 'Total Units',
                        data: colorTotalData,
                        backgroundColor: '#FF9800',
                        borderColor: '#F57C00',
                        borderWidth: 2
                    },
                    {
                        label: 'Delivered Units',
                        data: colorDeliveredData,
                        backgroundColor: '#2196F3',
                        borderColor: '#1976D2',
                        borderWidth: 2
                    }
                ]
            };
            return {
                metadata: {
                    generatedAt: new Date().toISOString(),
                    timeframe: filters.timeframe,
                    periodDisplay,
                    filtersApplied: this.getAppliedFilters(filters),
                    dateRange: {
                        from: dateFrom,
                        to: dateTo
                    }
                },
                summary: {
                    totalUnits: totalUnitsInPeriod,
                    deliveredUnits,
                    deliveryRate,
                    pendingUnits: totalUnitsInPeriod - deliveredUnits
                },
                byModel: unitsByModelRaw.map(item => {
                    const total = parseInt(item.totalunits || '0', 10);
                    const delivered = parseInt(item.deliveredunits || '0', 10);
                    return {
                        modelName: item.modelname || 'Unknown',
                        totalUnits: total,
                        deliveredUnits: delivered,
                        deliveryRate: total > 0 ?
                            ((delivered / total) * 100).toFixed(2) + '%' : '0%'
                    };
                }),
                byColor: unitsByColorRaw.map(item => {
                    const total = parseInt(item.totalunits || '0', 10);
                    const delivered = parseInt(item.deliveredunits || '0', 10);
                    return {
                        color: item.color || 'Unknown',
                        totalUnits: total,
                        deliveredUnits: delivered,
                        deliveryRate: total > 0 ?
                            ((delivered / total) * 100).toFixed(2) + '%' : '0%'
                    };
                }),
                chartData: {
                    totalUnitsByModel: filteredUnitsByModelChart,
                    totalVsDelivered: totalVsDeliveredChart,
                    unitsByModelComparison: unitsByModelComparisonChart,
                    unitsByColorComparison: unitsByColorComparisonChart
                },
                insights: this.generateReportInsights(totalUnitsInPeriod, deliveredUnits)
            };
        }
        catch (error) {
            throw new common_1.HttpException(`Error retrieving production report: ${error.message}`, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    generateColors(count) {
        const colors = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#F44336', '#4CAF50', '#2196F3', '#9C27B0',
            '#00BCD4', '#8BC34A', '#FF9800', '#795548', '#607D8B'
        ];
        return colors.slice(0, Math.min(count, colors.length));
    }
    getAppliedFilters(filters) {
        var _a, _b, _c, _d;
        const applied = [];
        const hasValidLocationFilter = ((_a = filters.locationIds) === null || _a === void 0 ? void 0 : _a.length) &&
            filters.locationIds.some(id => id && id !== "string" && id.trim() !== "");
        if (hasValidLocationFilter) {
            applied.push('Location Filter');
        }
        const hasValidModelFilter = ((_b = filters.modelIds) === null || _b === void 0 ? void 0 : _b.length) &&
            filters.modelIds.some(id => id && id !== "string" && id.trim() !== "");
        if (hasValidModelFilter) {
            applied.push('Model Filter');
        }
        const hasValidStatusFilter = ((_c = filters.statusNames) === null || _c === void 0 ? void 0 : _c.length) &&
            filters.statusNames.some(name => name && name !== "string" && name.trim() !== "");
        if (hasValidStatusFilter) {
            applied.push('Status Filter');
        }
        const hasValidColorFilter = ((_d = filters.colors) === null || _d === void 0 ? void 0 : _d.length) &&
            filters.colors.some(color => color && color !== "string" && color.trim() !== "");
        if (hasValidColorFilter) {
            applied.push('Color Filter');
        }
        return applied;
    }
    generateReportInsights(totalUnits, deliveredUnits) {
        const insights = [];
        if (totalUnits > 0) {
            const deliveryRate = (deliveredUnits / totalUnits) * 100;
            if (deliveryRate > 80) {
                insights.push('Excellent delivery performance (>80%)');
            }
            else if (deliveryRate > 60) {
                insights.push('Good delivery performance (60-80%)');
            }
            else if (deliveryRate < 30) {
                insights.push('Delivery rate needs improvement (<30%)');
            }
        }
        if (totalUnits > 100) {
            insights.push('High production volume (>100 units)');
        }
        if (deliveredUnits > totalUnits) {
            insights.push('More units delivered than built (clearing backlog)');
        }
        if (deliveredUnits === 0 && totalUnits > 0) {
            insights.push('No units delivered - focus on delivery process');
        }
        if (deliveredUnits > 0 && deliveredUnits === totalUnits) {
            insights.push('Perfect delivery rate (100%)');
        }
        return insights;
    }
    applyFilters(query, filters) {
        var _a, _b, _c, _d, _e, _f, _g;
        const hasValidLocationFilter = ((_a = filters.locationIds) === null || _a === void 0 ? void 0 : _a.length) &&
            filters.locationIds.some(id => id && id !== "string" && id.trim() !== "");
        if (hasValidLocationFilter) {
            const validLocationIds = filters.locationIds.filter(id => id && id !== "string" && id.trim() !== "");
            const hasLocationJoin = (_b = query.expressionMap.aliases) === null || _b === void 0 ? void 0 : _b.some((alias) => alias.name === 'location');
            if (!hasLocationJoin) {
                query.leftJoin('unit.location', 'location');
            }
            query.andWhere('location.locationId IN (:...locationIds)', {
                locationIds: validLocationIds
            });
        }
        const hasValidModelFilter = ((_c = filters.modelIds) === null || _c === void 0 ? void 0 : _c.length) &&
            filters.modelIds.some(id => id && id !== "string" && id.trim() !== "");
        if (hasValidModelFilter) {
            const numericModelIds = filters.modelIds
                .filter(id => id && id !== "string" && id.trim() !== "" && !isNaN(Number(id)))
                .map(id => Number(id));
            if (numericModelIds.length > 0) {
                const hasModelJoin = (_d = query.expressionMap.aliases) === null || _d === void 0 ? void 0 : _d.some((alias) => alias.name === 'model');
                if (!hasModelJoin) {
                    query.leftJoin('unit.model', 'model');
                }
                query.andWhere('model.modelId IN (:...modelIds)', {
                    modelIds: numericModelIds
                });
            }
        }
        const hasValidStatusFilter = ((_e = filters.statusNames) === null || _e === void 0 ? void 0 : _e.length) &&
            filters.statusNames.some(name => name && name !== "string" && name.trim() !== "");
        if (hasValidStatusFilter) {
            const validStatusNames = filters.statusNames.filter(name => name && name !== "string" && name.trim() !== "");
            const hasStatusJoin = (_f = query.expressionMap.aliases) === null || _f === void 0 ? void 0 : _f.some((alias) => alias.name === 'status');
            if (!hasStatusJoin) {
                query.leftJoin('unit.status', 'status');
            }
            query.andWhere('status.name IN (:...statusNames)', {
                statusNames: validStatusNames
            });
        }
        const hasValidColorFilter = ((_g = filters.colors) === null || _g === void 0 ? void 0 : _g.length) &&
            filters.colors.some(color => color && color !== "string" && color.trim() !== "");
        if (hasValidColorFilter) {
            const validColors = filters.colors.filter(color => color && color !== "string" && color.trim() !== "");
            query.andWhere('unit.color IN (:...colors)', {
                colors: validColors
            });
        }
    }
};
StatisticsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(Units_1.Units)),
    __param(1, (0, typeorm_1.InjectRepository)(Locations_1.Locations)),
    __param(2, (0, typeorm_1.InjectRepository)(Status_1.Status)),
    __param(3, (0, typeorm_1.InjectRepository)(Model_1.Model)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StatisticsService);
exports.StatisticsService = StatisticsService;
//# sourceMappingURL=statistics.service.js.map