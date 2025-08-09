import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { SystemConfig } from "src/db/entities/SystemConfig";
import { SystemConfigService } from "src/services/system-config.service";

@ApiTags("system-config")
@Controller("system-config")
@ApiBearerAuth("jwt")
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get("")
  @UseGuards(JwtAuthGuard)
  async getAll() {
    const res = {} as ApiResponseModel<SystemConfig[]>;
    try {
      res.data = await this.systemConfigService.getAll();
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Post("")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        key: { type: "string" },
        value: { type: "string" },
      },
      required: ["key", "value"],
    },
  })
  @UseGuards(JwtAuthGuard)
  async save(@Body() dto: { key: string; value: string; }) {
    const res = {} as ApiResponseModel<SystemConfig[]>;
    try {
      res.data = await this.systemConfigService.save(dto);
      res.success = true;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
