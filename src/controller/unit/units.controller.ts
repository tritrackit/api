import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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

  @Get("/:unitCode")
  // @UseGuards(JwtAuthGuard)
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
  // @UseGuards(JwtAuthGuard)
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
    } = {
      pageSize: "10",
      pageIndex: "0",
      order: { name: "ASC" },
      columnDef: [],
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

  @Put("/:unitId")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("unitId") unitId: string,
    @Body() dto: UpdateUnitDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Units> = {} as any;
    try {
      res.data = await this.unitsService.update(unitId, dto, userId);
      res.success = true;
      res.message = `Unit ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:unitId")
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param("unitId") unitId: string,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Units> = {} as any;
    try {
      res.data = await this.unitsService.delete(unitId, userId);
      res.success = true;
      res.message = `Unit ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("unit-logs")
  @ApiSecurity("apiKey")
  @UseGuards(ApiKeyScannerGuard)
  // @UseGuards(JwtAuthGuard)
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
}
