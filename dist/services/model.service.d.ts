import { CreateModelDto } from "src/core/dto/model/model.create.dto";
import { UpdateModelDto } from "src/core/dto/model/model.update.dto";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { Model } from "src/db/entities/Model";
import { Repository } from "typeorm";
import { UpdateModelOrderDto } from "src/core/dto/model/model.update-order.dto";
import { CloudinaryService } from "./cloudinary.service";
import { CacheService } from "./cache.service";
export declare class ModelService {
    private firebaseProvider;
    private readonly modelRepo;
    private readonly cloudinaryService;
    private readonly cacheService;
    private readonly logger;
    constructor(firebaseProvider: FirebaseProvider, modelRepo: Repository<Model>, cloudinaryService: CloudinaryService, cacheService: CacheService);
    getPagination({ pageSize, pageIndex, order, keywords }: {
        pageSize: any;
        pageIndex: any;
        order: any;
        keywords: any;
    }): Promise<{
        results: any[];
        total: number;
    }>;
    getById(modelId: string): Promise<Model>;
    create(dto: CreateModelDto, createdByUserId: string): Promise<Model>;
    update(modelId: any, dto: UpdateModelDto, updatedByUserId: string): Promise<Model>;
    updateOrder(dtos: UpdateModelOrderDto[], updatedByUserId: string): Promise<Model[]>;
    delete(modelId: string, updatedByUserId: string): Promise<Model>;
}
