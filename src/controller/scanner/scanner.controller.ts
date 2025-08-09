import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import {
  DELETE_SUCCESS,
  SAVING_SUCCESS,
  UPDATE_SUCCESS,
} from "src/common/constant/api-response.constant";
import { CreateScannerDto } from "src/core/dto/scanner/scanner.create.dto";
import { UpdateScannerDto } from "src/core/dto/scanner/scanner.update.dto";
import { PaginationParamsDto } from "src/core/dto/pagination-params.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Scanner } from "src/db/entities/Scanner";
import { ScannerService } from "src/services/scanner.service";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { GetUser } from "src/core/auth/get-user.decorator";

@ApiTags("scanner")
@Controller("scanner")
@ApiBearerAuth("jwt")
export class ScannerController {
  constructor(private readonly scannerService: ScannerService) {}

  @Get("/:scannerId")
  // @UseGuards(JwtAuthGuard)
  async getById(@Param("scannerId") scannerId: string) {
    const res = {} as ApiResponseModel<Scanner>;
    try {
      res.data = await this.scannerService.getById(scannerId);
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
    const res: ApiResponseModel<{ results: Scanner[]; total: number }> =
      {} as any;
    try {
      res.data = await this.scannerService.getPagination(params);
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
    @Body() accessDto: CreateScannerDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Scanner> = {} as any;
    try {
      res.data = await this.scannerService.create(accessDto, userId);
      res.success = true;
      res.message = `Scanner ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/:scannerId")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("scannerId") scannerId: string,
    @Body() dto: UpdateScannerDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Scanner> = {} as any;
    try {
      res.data = await this.scannerService.update(scannerId, dto, userId);
      res.success = true;
      res.message = `Scanner ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:scannerId")
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param("scannerId") scannerId: string,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Scanner> = {} as any;
    try {
      res.data = await this.scannerService.delete(scannerId, userId);
      res.success = true;
      res.message = `Scanner ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
