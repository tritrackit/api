import {
  Controller,
  Body,
  Post,
  Get,
  Req,
  UseGuards,
  Param,
  Headers,
  Query,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "../../services/auth.service";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { EmployeeUserLogInDto } from "src/core/dto/auth/login.dto";
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
import { GetUser } from "src/core/auth/get-user.decorator";
import { RefreshTokenGuard } from "src/core/auth/refresh-token.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  public async loginEmployeeUser(@Body() dto: EmployeeUserLogInDto) {
    const res: ApiResponseModel<EmployeeUsers> =
      {} as ApiResponseModel<EmployeeUsers>;
    try {
      res.data = await this.authService.getUserByCredentials(dto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("verify")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string" },
        hashCode: { type: "string" },
      },
      required: ["email", "hashCode"],
    },
  })
  public async verify(
    @Body()
    dto: {
      email: string;
      hashCode: string;
    } = { email: "", hashCode: "" }
  ) {
    const res: ApiResponseModel<EmployeeUsers> =
      {} as ApiResponseModel<EmployeeUsers>;
    try {
      res.data = await this.authService.verify(dto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("refresh")
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth("jwt")
  refresh(
    @GetUser("sub") employeeUserId: string,
    @GetUser("refreshToken") refreshToken: string
  ) {
    return this.authService.refresh(employeeUserId, refreshToken);
  }
}
