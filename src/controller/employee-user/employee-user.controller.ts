import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiParam, ApiBody, ApiBearerAuth } from "@nestjs/swagger";
import {
  SAVING_SUCCESS,
  UPDATE_SUCCESS,
  DELETE_SUCCESS,
} from "src/common/constant/api-response.constant";
import {
  ProfileResetPasswordDto,
  UpdateUserPasswordDto,
} from "src/core/dto/auth/reset-password.dto";
import { PaginationParamsDto } from "src/core/dto/pagination-params.dto";
import { CreateEmployeeUserDto } from "src/core/dto/employee-user/employee-user.create.dto";
import {
  UpdateEmployeeUserDto,
  UpdateEmployeeUserProfileDto,
} from "src/core/dto/employee-user/employee-user.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { EmployeeUserService } from "src/services/employee-user.service";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { GetUser } from "src/core/auth/get-user.decorator";

@ApiTags("employee-users")
@Controller("employee-users")
@ApiBearerAuth("jwt")
export class EmployeeUserController {
  constructor(private readonly employeeUserService: EmployeeUserService) {}

  @Get("/:employeeUserCode")
  // @UseGuards(JwtAuthGuard)
  async getByCode(@Param("employeeUserCode") employeeUserCode: string) {
    const res = {} as ApiResponseModel<EmployeeUsers>;
    try {
      res.data = await this.employeeUserService.getByCode(employeeUserCode);
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
  async getPagination(@Body() paginationParams: PaginationParamsDto) {
    const res: ApiResponseModel<{ results: EmployeeUsers[]; total: number }> =
      {} as any;
    try {
      res.data = await this.employeeUserService.getPagination(paginationParams);
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
    @Body() dto: CreateEmployeeUserDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<EmployeeUsers> = {} as any;
    try {
      res.data = await this.employeeUserService.create(dto, userId);
      res.success = true;
      res.message = `Employee User  ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("resend-invitation")
  @UseGuards(JwtAuthGuard)
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        employeeUserCode: { type: "string" },
      },
      required: ["employeeUserCode"],
    },
  })
  async resendInvitation(
    @Body()
    dto: {
      employeeUserCode: string;
    } = { employeeUserCode: "" }
  ) {
    const res: ApiResponseModel<EmployeeUsers> = {} as any;
    try {
      res.data = await this.employeeUserService.resendInvitation(
        dto.employeeUserCode
      );
      res.success = true;
      res.message = `Employee User Invitation Resent ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/updateProfile/")
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @GetUser("sub") userId: string,
    @Body() dto: UpdateEmployeeUserProfileDto
  ) {
    const res: ApiResponseModel<EmployeeUsers> = {} as any;
    try {
      res.data = await this.employeeUserService.updateProfile(userId, dto);
      res.success = true;
      res.message = `Employee User ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/:employeeUserCode")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("employeeUserCode") employeeUserCode: string,
    @Body() dto: UpdateEmployeeUserDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<EmployeeUsers> = {} as any;
    try {
      res.data = await this.employeeUserService.update(
        employeeUserCode,
        dto,
        userId
      );
      res.success = true;
      res.message = `Employee User ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:employeeUserCode")
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param("employeeUserCode") employeeUserCode: string,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<EmployeeUsers> = {} as any;
    try {
      res.data = await this.employeeUserService.delete(
        employeeUserCode,
        userId
      );
      res.success = true;
      res.message = `Employee User ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
