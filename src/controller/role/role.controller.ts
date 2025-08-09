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
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import {
  DELETE_SUCCESS,
  SAVING_SUCCESS,
  UPDATE_SUCCESS,
} from "src/common/constant/api-response.constant";
import { GetUser } from "src/core/auth/get-user.decorator";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { PaginationParamsDto } from "src/core/dto/pagination-params.dto";
import { CreateRoleDto } from "src/core/dto/roles/roles.create.dto";
import { UpdateRoleDto } from "src/core/dto/roles/roles.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Roles } from "src/db/entities/Roles";
import { RoleService } from "src/services/roles.service";

@ApiTags("roles")
@Controller("roles")
@ApiBearerAuth("jwt")
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get("/:roleCode")
  //   @UseGuards(JwtAuthGuard)
  async getDetails(@Param("roleCode") roleCode: string) {
    const res = {} as ApiResponseModel<Roles>;
    try {
      res.data = await this.roleService.getByCode(roleCode);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("/page")
  //   @UseGuards(JwtAuthGuard)
  async getPaginated(@Body() params: PaginationParamsDto) {
    const res: ApiResponseModel<{ results: Roles[]; total: number }> =
      {} as any;
    try {
      res.data = await this.roleService.getPagination(params);
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
    @Body() accessDto: CreateRoleDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Roles> = {} as any;
    try {
      res.data = await this.roleService.create(accessDto, userId);
      res.success = true;
      res.message = `Role ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/:roleCode")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("roleCode") roleCode: string,
    @Body() dto: UpdateRoleDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Roles> = {} as any;
    try {
      res.data = await this.roleService.update(roleCode, dto, userId);
      res.success = true;
      res.message = `Role ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:roleCode")
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param("roleCode") roleCode: string,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Roles> = {} as any;
    try {
      res.data = await this.roleService.delete(roleCode, userId);
      res.success = true;
      res.message = `Role ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
