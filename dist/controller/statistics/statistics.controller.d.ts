import { ApiResponseModel } from "src/core/models/api-response.model";
import { StatisticsService } from "src/services/statistics.service";
import { StatisticsFilterDto } from "src/core/dto/statistics/statistics.dto";
export declare class StatisticsController {
    private readonly statisticsService;
    constructor(statisticsService: StatisticsService);
    getDashboardData(filters: StatisticsFilterDto): Promise<ApiResponseModel<any>>;
    getTodayDashboard(): Promise<ApiResponseModel<any>>;
    getMonthlyReport(filters: StatisticsFilterDto): Promise<ApiResponseModel<any>>;
    getCurrentMonthReport(): Promise<ApiResponseModel<any>>;
    getCustomReport(filters: StatisticsFilterDto): Promise<ApiResponseModel<any>>;
    getCurrentWeekDashboard(): Promise<ApiResponseModel<any>>;
    getCurrentYearDashboard(): Promise<ApiResponseModel<any>>;
}
