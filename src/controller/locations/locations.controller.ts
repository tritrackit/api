import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  Put,
} from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: "Get fixed location by ID",
    description: "Returns one of the 4 fixed locations: Open Area, Warehouse 4, Warehouse 5, or Delivered" 
  })
  @ApiResponse({ 
    status: 200, 
    description: "Returns the fixed location" 
  })
  @ApiResponse({ 
    status: 404, 
    description: "Location not found - must be one of the 4 fixed locations" 
  })
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
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: "Get paginated list of fixed locations",
    description: "Returns all 4 fixed locations in paginated format. Locations are predefined and cannot be created, updated, or deleted." 
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        pageSize: { type: "number", example: 10 },
        pageIndex: { type: "number", example: 0 },
        order: { type: "object", default: { name: "ASC" } },
        columnDef: { type: "array", default: [] },
      },
      required: ["pageSize", "pageIndex", "order", "columnDef"],
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: "Returns paginated fixed locations (always 4 total)" 
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

  @Get("/all/fixed")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: "Get all fixed locations for dropdown",
    description: "Returns all 4 fixed locations in alphabetical order. Use for UI dropdowns." 
  })
  @ApiResponse({ 
    status: 200, 
    description: "Returns array of all 4 fixed locations" 
  })
  async getAllFixedLocations() {
    const res: ApiResponseModel<Locations[]> = {} as any;
    try {
      res.data = await this.locationsService.getAllFixedLocations();
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  // ========== DISABLED ENDPOINTS ==========
  // These endpoints return 410 Gone since locations are fixed

  @Post("")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.GONE)
  @ApiOperation({ 
    summary: "DISABLED - Locations are fixed",
    description: "This endpoint is disabled. Locations are predefined (Open Area, Warehouse 4, Warehouse 5, Delivered) and cannot be created." 
  })
  @ApiResponse({ 
    status: 410, 
    description: "Gone - This endpoint is disabled" 
  })
  async createDisabled() {
    const res = {} as ApiResponseModel<any>;
    res.success = false;
    res.message = "Creating locations is disabled. Locations are fixed: Open Area, Warehouse 4, Warehouse 5, Delivered.";
    res.data = null;
    return res;
  }

  @Put("/:locationId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.GONE)
  @ApiOperation({ 
    summary: "DISABLED - Locations are fixed",
    description: "This endpoint is disabled. Locations are predefined and cannot be updated." 
  })
  @ApiResponse({ 
    status: 410, 
    description: "Gone - This endpoint is disabled" 
  })
  async updateDisabled(
    @Param("locationId") locationId: string,
    @Body() dto: any,
    @GetUser("sub") userId: string
  ) {
    const res = {} as ApiResponseModel<any>;
    res.success = false;
    res.message = "Updating locations is disabled. Locations are fixed and cannot be modified.";
    res.data = null;
    return res;
  }

  @Delete("/:locationId")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.GONE)
  @ApiOperation({ 
    summary: "DISABLED - Locations are fixed",
    description: "This endpoint is disabled. Locations are predefined and cannot be deleted." 
  })
  @ApiResponse({ 
    status: 410, 
    description: "Gone - This endpoint is disabled" 
  })
  async deleteDisabled(
    @Param("locationId") locationId: string,
    @GetUser("sub") userId: string
  ) {
    const res = {} as ApiResponseModel<any>;
    res.success = false;
    res.message = "Deleting locations is disabled. Locations are fixed and required for system operations.";
    res.data = null;
    return res;
  }
}