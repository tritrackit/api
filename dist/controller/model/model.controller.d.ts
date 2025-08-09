import { CreateModelDto } from "src/core/dto/model/model.create.dto";
import { UpdateModelDto } from "src/core/dto/model/model.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Model } from "src/db/entities/Model";
import { ModelService } from "src/services/model.service";
import { UpdateModelOrderDto } from "src/core/dto/model/model.update-order.dto";
export declare class ModelController {
    private readonly modelService;
    constructor(modelService: ModelService);
    getDetails(modelId: string): Promise<ApiResponseModel<Model>>;
    getPaginated(params?: {
        pageSize: string;
        pageIndex: string;
        order: any;
        keywords: string;
    }): Promise<ApiResponseModel<{
        results: Model[];
        total: number;
    }>>;
    create(accessDto: CreateModelDto, userId: string): Promise<ApiResponseModel<Model>>;
    updateOrder(dto: UpdateModelOrderDto[], userId: string): Promise<ApiResponseModel<Model[]>>;
    update(modelId: string, dto: UpdateModelDto, userId: string): Promise<ApiResponseModel<Model>>;
    delete(modelId: string, userId: string): Promise<ApiResponseModel<Model>>;
}
