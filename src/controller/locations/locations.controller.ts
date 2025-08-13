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
import { CreateLocationsDto } from "src/core/dto/locations/locations.create.dto";
import { UpdateLocationsDto } from "src/core/dto/locations/locations.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Locations } from "src/db/entities/Locations";
import { LocationsService } from "src/services/locations.service";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { GetUser } from "src/core/auth/get-user.decorator";

@ApiTags("locations")
@Controller("locations")
@ApiBearerAuth("jwt")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get("/:locationId")
  // @UseGuards(JwtAuthGuard)
  async getById(@Param("locationId") locationId: string) {
    const res = {} as ApiResponseModel<Locations>;
    try {
      res.data = await this.locationsService.getById(locationId);
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
        order: { type: "object", default: { lastUpdatedAt: "ASC" } },
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
    const res: ApiResponseModel<{ results: Locations[]; total: number }> =
      {} as any;
    try {
      res.data = await this.locationsService.getPagination(params);
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
    @Body() accessDto: CreateLocationsDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Locations> = {} as any;
    try {
      res.data = await this.locationsService.create(accessDto, userId);
      res.success = true;
      res.message = `Location ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/:locationId")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("locationId") locationId: string,
    @Body() dto: UpdateLocationsDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Locations> = {} as any;
    try {
      res.data = await this.locationsService.update(locationId, dto, userId);
      res.success = true;
      res.message = `Location ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:locationId")
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param("locationId") locationId: string,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Locations> = {} as any;
    try {
      res.data = await this.locationsService.delete(locationId, userId);
      res.success = true;
      res.message = `Location ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
