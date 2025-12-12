import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiSecurity, ApiTags } from "@nestjs/swagger";
import {
  DELETE_SUCCESS,
  SAVING_SUCCESS,
  UPDATE_SUCCESS,
} from "src/common/constant/api-response.constant";
import { CreateUnitDto } from "src/core/dto/unit/unit.create.dto";
import { UpdateUnitDto } from "src/core/dto/unit/unit.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Units } from "src/db/entities/Units";
import { UnitsService } from "src/services/units.service";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { GetUser } from "src/core/auth/get-user.decorator";
import { LogsDto } from "src/core/dto/unit/unit-logs.dto";
import { UnitLogs } from "src/db/entities/UnitLogs";
import { ApiKeyScannerGuard } from "src/core/auth/api-key-scanner.guard";

@ApiTags("units")
@Controller("units")
@ApiBearerAuth("jwt")
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  // More specific route must come first
  @Get("/:unitCode/activity-history")
  @UseGuards(JwtAuthGuard)
  async getActivityHistory(
    @Param("unitCode") unitCode: string,
    @Query("pageSize") pageSize?: string,
    @Query("pageIndex") pageIndex?: string
  ) {
    const res: ApiResponseModel<{ results: UnitLogs[]; total: number }> = {} as any;
    try {
      const size = pageSize ? Number(pageSize) : 50;
      const index = pageIndex ? Number(pageIndex) : 0;
      res.data = await this.unitsService.getActivityHistory(unitCode, size, index);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Get("/:unitCode")
  @UseGuards(JwtAuthGuard)
  async getByCode(@Param("unitCode") unitCode: string) {
    const res = {} as ApiResponseModel<Units>;
    try {
      res.data = await this.unitsService.getByCode(unitCode);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("/page")
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        pageSize: { type: "number", example: 10 },
        pageIndex: { type: "number", example: 0 },
        order: { type: "object", default: { lastUpdatedAt: "DESC" } },
        columnDef: { type: "array", default: [] },
      },
      required: ["pageSize", "pageIndex", "order", "columnDef"],
    },
  })
  async getPaginated(
    @Body()
    params: {
      pageSize: string;
      pageIndex: string;
      order: any;
      columnDef: any[];
    }
  ) {
    const res: ApiResponseModel<{ results: Units[]; total: number }> =
      {} as any;
    try {
      res.data = await this.unitsService.getPagination(params);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("")
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() accessDto: CreateUnitDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Units> = {} as any;
    try {
      res.data = await this.unitsService.create(accessDto, userId);
      res.success = true;
      res.message = `Unit ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/:unitCode")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("unitCode") unitCode: string,
    @Body() dto: UpdateUnitDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Units> = {} as any;
    try {
      res.data = await this.unitsService.update(unitCode, dto, userId);
      res.success = true;
      res.message = `Unit ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:unitCode")
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param("unitCode") unitCode: string,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Units> = {} as any;
    try {
      res.data = await this.unitsService.delete(unitCode, userId);
      res.success = true;
      res.message = `Unit ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  // Hardware scanner endpoint (for unit-logs from physical scanners)
  @Post("unit-logs")
  @ApiSecurity("apiKey")
  @UseGuards(ApiKeyScannerGuard)
  async unitLogs(@Body() dto: LogsDto, @Req() req: any) {
    const res: ApiResponseModel<UnitLogs[]> = {} as any;
    try {
      res.data = await this.unitsService.unitLogs(dto, req.scanner?.code);
      res.success = true;
      res.message = `Unit logs ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  // ✅ WEB INTERFACE REGISTRATION (via JWT) - ULTRA-FAST with predictive notifications
  @Post("register")
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        scannerCode: { type: "string", example: "REG_DESK" },
        rfid: { type: "string", example: "TEST_RFID_001" },
        chassisNo: { type: "string", example: "CH-001" },
        color: { type: "string", example: "Red" },
        description: { type: "string", example: "Test unit" },
        modelId: { type: "string", example: "1" }
      },
      required: ["scannerCode", "rfid", "chassisNo", "color", "description", "modelId"]
    }
  })
  async registerUnit(
    @Body() dto: { 
      scannerCode: string; 
      rfid: string; 
      chassisNo?: string;
      color?: string;
      description?: string;
      modelId?: string;
    }
  ) {
    const res: ApiResponseModel<any> = {} as any;
    const requestStart = Date.now();
    
    try {
      // ⚡ Generate transaction ID for tracking
      const transactionId = `tx_${requestStart}_${Math.random().toString(36).substr(2, 9)}`;
      const predictiveSentAt = Date.now();
      
      // ⚡ Call ultra-fast service
      res.data = await this.unitsService.registerUnitUltraFast(
        dto.rfid, 
        dto.scannerCode,
        {
          chassisNo: dto.chassisNo,
          color: dto.color,
          description: dto.description,
          modelId: dto.modelId
        }
      );
      
      res.success = true;
      res.message = `Unit ${SAVING_SUCCESS}`;
      
      // ⚡ Add predictive metadata to response (as part of data)
      if (res.data) {
        (res.data as any).metadata = {
          transactionId,
          requestStart,
          predictiveSentAt,
          responseTime: Date.now() - requestStart,
          expectedChannels: ['registration-urgent', 'all'],
          expectedEvents: ['rfid-detected', 'reSync'],
          pusherAction: 'UNIT_REGISTERING_PREDICTIVE',
          _ultraFastMode: true,
          _predictiveUI: true
        };
      }
      
      return res;
      
    } catch (e) {
      // Send failure notification
      const errorTransactionId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Try to send failure notification (non-blocking)
      try {
        (this.unitsService as any).sendRegistrationFailed?.(
          dto.rfid, 
          errorTransactionId, 
          e.message
        );
      } catch (notifError) {
        // Ignore notification errors
      }
      
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      
      // ⚡ Add error metadata to response
      (res as any).metadata = {
        errorTransactionId,
        requestStart,
        responseTime: Date.now() - requestStart,
        error: e.message
      };
      
      return res;
    }
  }

  // ✅ WEB INTERFACE LOCATION SCAN (via JWT)
  @Post("scan-location")
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        scannerCode: { type: "string", example: "WH5_ENTRY" },
        rfid: { type: "string", example: "TEST_RFID_001" }
      },
      required: ["scannerCode", "rfid"]
    }
  })
  async updateUnitLocation(
    @Body() dto: { scannerCode: string; rfid: string }
  ) {
    const res: ApiResponseModel<any> = {} as any;
    try {
      res.data = await this.unitsService.updateUnitLocation(
        dto.rfid, 
        dto.scannerCode // From request body
      );
      res.success = true;
      res.message = "Unit location updated successfully";
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}