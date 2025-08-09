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
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  public async login(@Body() dto: EmployeeUserLogInDto) {
    const res: ApiResponseModel<EmployeeUsers> =
      {} as ApiResponseModel<EmployeeUsers>;
    try {
      res.data = await this.authService.login(dto);
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

  @ApiBearerAuth("jwt")
  @Post("/logout")
  @UseGuards(JwtAuthGuard)
  public async logout(@GetUser("sub") userId: string) {
    const res: ApiResponseModel<any> = {} as any;
    try {
      this.authService.logOut(userId);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("/refresh-token")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        employeeUserId: { type: "string", example: "" },
        refresh_token: { type: "string", example: "" },
      },
      required: ["employeeUserId", "refresh_token"],
    },
  })
  async refreshToken(
    @Body() params: { employeeUserId: string; refresh_token: string }
  ) {
    return await this.authService.getNewAccessAndRefreshToken(
      params.refresh_token,
      params.employeeUserId
    );
  }
}
