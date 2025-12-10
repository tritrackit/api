import { Repository } from 'typeorm';
import { Units } from 'src/db/entities/Units';
import { Locations } from 'src/db/entities/Locations';
import { Status } from 'src/db/entities/Status';
import { Model } from 'src/db/entities/Model';
import { StatisticsFilterDto } from 'src/core/dto/statistics/statistics.dto';
export declare class StatisticsService {
    private unitsRepo;
    private locationsRepo;
    private statusRepo;
    private modelRepo;
    constructor(unitsRepo: Repository<Units>, locationsRepo: Repository<Locations>, statusRepo: Repository<Status>, modelRepo: Repository<Model>);
    private getDateRange;
    getDashboardData(filters: StatisticsFilterDto): Promise<{
        metadata: {
            generatedAt: string;
            timeframe: import("src/core/dto/statistics/statistics.dto").TimeframeDto;
            filtersApplied: any[];
            dateRange: {
                from: Date;
                to: Date;
            };
        };
        summary: {
            totalUnits: number;
            unitsInStorage: number;
            unitsOnHold: number;
            unitsForDelivery: number;
            unitsCreatedInPeriod: number;
        };
        colorDistribution: {
            color: any;
            count: number;
            percentage: string;
        }[];
        chartData: {
            unitsByModel: {
                labels: any[];
                datasets: {
                    label: string;
                    data: number[];
                    backgroundColor: string[];
                    borderColor: string[];
                    borderWidth: number;
                }[];
            };
            unitsByColor: {
                labels: any[];
                datasets: {
                    label: string;
                    data: number[];
                    backgroundColor: string[];
                    borderColor: string[];
                    borderWidth: number;
                }[];
            };
        };
    }>;
    getProductionReport(filters: StatisticsFilterDto): Promise<{
        metadata: {
            generatedAt: string;
            timeframe: import("src/core/dto/statistics/statistics.dto").TimeframeDto;
            periodDisplay: string;
            filtersApplied: any[];
            dateRange: {
                from: Date;
                to: Date;
            };
        };
        summary: {
            totalUnits: number;
            deliveredUnits: number;
            deliveryRate: string;
            pendingUnits: number;
        };
        byModel: {
            modelName: any;
            totalUnits: number;
            deliveredUnits: number;
            deliveryRate: string;
        }[];
        byColor: {
            color: any;
            totalUnits: number;
            deliveredUnits: number;
            deliveryRate: string;
        }[];
        chartData: {
            totalUnitsByModel: {
                labels: any[];
                datasets: {
                    label: string;
                    data: number[];
                    backgroundColor: string[];
                    borderColor: string[];
                    borderWidth: number;
                }[];
            };
            totalVsDelivered: {
                labels: string[];
                datasets: {
                    label: string;
                    data: number[];
                    backgroundColor: string[];
                    borderColor: string[];
                    borderWidth: number;
                }[];
            };
            unitsByModelComparison: {
                labels: any[];
                datasets: {
                    label: string;
                    data: number[];
                    backgroundColor: string;
                    borderColor: string;
                    borderWidth: number;
                }[];
            };
            unitsByColorComparison: {
                labels: any[];
                datasets: {
                    label: string;
                    data: number[];
                    backgroundColor: string;
                    borderColor: string;
                    borderWidth: number;
                }[];
            };
        };
        insights: any[];
    }>;
    private generateColors;
    private getAppliedFilters;
    private generateReportInsights;
    private applyFilters;
}
