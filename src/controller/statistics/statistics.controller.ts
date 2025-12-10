import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { StatisticsService } from "src/services/statistics.service";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { StatisticsFilterDto } from "src/core/dto/statistics/statistics.dto";
import { TimeframeType } from "src/core/dto/statistics/statistics.dto";

@ApiTags("statistics")
@Controller("statistics")
@ApiBearerAuth("jwt")
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  // DASHBOARD ENDPOINT - Daily data
  @Post("dashboard")
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: StatisticsFilterDto })
  async getDashboardData(@Body() filters: StatisticsFilterDto) {
    const res = {} as ApiResponseModel<any>;
    try {
      // Validate timeframe
      if (!filters.timeframe) {
        filters.timeframe = { type: TimeframeType.DAILY };
      }
      
      // Force DAILY timeframe for dashboard if not specified
      const dashboardFilters = {
        ...filters,
        timeframe: {
          ...filters.timeframe,
          type: filters.timeframe?.type || TimeframeType.DAILY
        }
      };
      res.data = await this.statisticsService.getDashboardData(dashboardFilters);
      res.success = true;
      res.message = "Dashboard data retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      if (e instanceof HttpException) {
        throw e;
      }
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  // QUICK ACCESS - Today's dashboard
  @Get("dashboard/today")
  @UseGuards(JwtAuthGuard)
  async getTodayDashboard() {
    const res = {} as ApiResponseModel<any>;
    try {
      const filters: StatisticsFilterDto = {
        timeframe: {
          type: TimeframeType.DAILY
        }
      };
      res.data = await this.statisticsService.getDashboardData(filters);
      res.success = true;
      res.message = "Today's dashboard data retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      if (e instanceof HttpException) {
        throw e;
      }
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  // REPORT ENDPOINT - Monthly data (with optional filters)
  @Post("reports/monthly")
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: StatisticsFilterDto })
  async getMonthlyReport(@Body() filters: StatisticsFilterDto) {
    const res = {} as ApiResponseModel<any>;
    try {
      // Validate timeframe
      if (!filters.timeframe) {
        filters.timeframe = { type: TimeframeType.MONTHLY };
      }
      
      // Use provided timeframe or default to MONTHLY
      const reportFilters = {
        ...filters,
        timeframe: {
          ...filters.timeframe,
          type: filters.timeframe?.type || TimeframeType.MONTHLY
        }
      };
      res.data = await this.statisticsService.getProductionReport(reportFilters);
      res.success = true;
      res.message = "Monthly report retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      if (e instanceof HttpException) {
        throw e;
      }
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  // QUICK ACCESS - Current month report
  @Get("reports/current-month")
  @UseGuards(JwtAuthGuard)
  async getCurrentMonthReport() {
    const res = {} as ApiResponseModel<any>;
    try {
      const filters: StatisticsFilterDto = {
        timeframe: {
          type: TimeframeType.MONTHLY
        }
      };
      res.data = await this.statisticsService.getProductionReport(filters);
      res.success = true;
      res.message = "Current month report retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      if (e instanceof HttpException) {
        throw e;
      }
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  // Custom timeframe report
  @Post("reports/custom")
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: StatisticsFilterDto })
  async getCustomReport(@Body() filters: StatisticsFilterDto) {
    const res = {} as ApiResponseModel<any>;
    try {
      if (!filters.timeframe) {
        throw new HttpException(
          "Timeframe is required for custom reports",
          HttpStatus.BAD_REQUEST
        );
      }
      res.data = await this.statisticsService.getProductionReport(filters);
      res.success = true;
      res.message = "Custom report retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      if (e instanceof HttpException) {
        throw e;
      }
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  // Quick access - Current week dashboard
  @Get("dashboard/current-week")
  @UseGuards(JwtAuthGuard)
  async getCurrentWeekDashboard() {
    const res = {} as ApiResponseModel<any>;
    try {
      const filters: StatisticsFilterDto = {
        timeframe: {
          type: TimeframeType.WEEKLY
        }
      };
      res.data = await this.statisticsService.getDashboardData(filters);
      res.success = true;
      res.message = "Current week dashboard data retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      if (e instanceof HttpException) {
        throw e;
      }
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  // Quick access - Current year dashboard
  @Get("dashboard/current-year")
  @UseGuards(JwtAuthGuard)
  async getCurrentYearDashboard() {
    const res = {} as ApiResponseModel<any>;
    try {
      const filters: StatisticsFilterDto = {
        timeframe: {
          type: TimeframeType.YEARLY
        }
      };
      res.data = await this.statisticsService.getDashboardData(filters);
      res.success = true;
      res.message = "Current year dashboard data retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      if (e instanceof HttpException) {
        throw e;
      }
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }
}