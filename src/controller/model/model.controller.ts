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
import { CreateModelDto } from "src/core/dto/model/model.create.dto";
import { UpdateModelDto } from "src/core/dto/model/model.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Model } from "src/db/entities/Model";
import { ModelService } from "src/services/model.service";
import { UpdateModelOrderDto } from "src/core/dto/model/model.update-order.dto";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { GetUser } from "src/core/auth/get-user.decorator";

@ApiTags("model")
@Controller("model")
@ApiBearerAuth("jwt")
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get("/:modelId")
  // @UseGuards(JwtAuthGuard)
  async getDetails(@Param("modelId") modelId: string) {
    const res = {} as ApiResponseModel<Model>;
    try {
      res.data = await this.modelService.getById(modelId);
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
        order: { type: "object", default: { sequenceId: "ASC" } },
        keywords: { type: "string", example: "", default: "" },
      },
      required: ["pageSize", "pageIndex", "order", "keywords"],
    },
  })
  async getPaginated(
    @Body()
    params: {
      pageSize: string;
      pageIndex: string;
      order: any;
      keywords: string;
    } = { pageSize: "10", pageIndex: "0", order: { name: "ASC" }, keywords: "" }
  ) {
    const res: ApiResponseModel<{ results: Model[]; total: number }> =
      {} as any;
    try {
      res.data = await this.modelService.getPagination(params);
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
    @Body() accessDto: CreateModelDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Model> = {} as any;
    try {
      res.data = await this.modelService.create(accessDto, userId);
      res.success = true;
      res.message = `Model ${SAVING_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/updateOrder")
  @UseGuards(JwtAuthGuard)
  async updateOrder(
    @Body() dto: UpdateModelOrderDto[],
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Model[]> = {} as any;
    try {
      res.data = await this.modelService.updateOrder(dto, userId);
      res.success = true;
      res.message = `Model ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Put("/:modelId")
  @UseGuards(JwtAuthGuard)
  async update(
    @Param("modelId") modelId: string,
    @Body() dto: UpdateModelDto,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Model> = {} as any;
    try {
      res.data = await this.modelService.update(modelId, dto, userId);
      res.success = true;
      res.message = `Model ${UPDATE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }

  @Delete("/:modelId")
  @UseGuards(JwtAuthGuard)
  async delete(
    @Param("modelId") modelId: string,
    @GetUser("sub") userId: string
  ) {
    const res: ApiResponseModel<Model> = {} as any;
    try {
      res.data = await this.modelService.delete(modelId, userId);
      res.success = true;
      res.message = `Model ${DELETE_SUCCESS}`;
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : e;
      return res;
    }
  }
}
