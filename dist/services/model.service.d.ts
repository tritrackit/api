import { CreateModelDto } from "src/core/dto/model/model.create.dto";
import { UpdateModelDto } from "src/core/dto/model/model.update.dto";
import { FirebaseProvider } from "src/core/provider/firebase/firebase-provider";
import { Model } from "src/db/entities/Model";
import { Units } from "src/db/entities/Units";
import { Repository } from "typeorm";
import { File } from "src/db/entities/File";
import { UpdateModelOrderDto } from "src/core/dto/model/model.update-order.dto";
import { EmployeeUsers } from "src/db/entities/EmployeeUsers";
export declare class ModelService {
    private firebaseProvider;
    private readonly modelRepo;
    constructor(firebaseProvider: FirebaseProvider, modelRepo: Repository<Model>);
    getPagination({ pageSize, pageIndex, order, keywords }: {
        pageSize: any;
        pageIndex: any;
        order: any;
        keywords: any;
    }): Promise<{
        results: any[];
        total: number;
    }>;
    getById(modelId: any): Promise<{
        unitCount: number;
        modelId: string;
        sequenceId: string;
        modelName: string;
        description: string;
        dateCreated: Date;
        lastUpdatedAt: Date;
        active: boolean;
        createdBy: EmployeeUsers;
        thumbnailFile: File;
        updatedBy: EmployeeUsers;
        units: Units[];
    }>;
    create(dto: CreateModelDto, createdByUserId: string): Promise<Model>;
    update(modelId: any, dto: UpdateModelDto, updatedByUserId: string): Promise<Model>;
    updateOrder(dtos: UpdateModelOrderDto[], updatedByUserId: string): Promise<Model[]>;
    delete(modelId: string, updatedByUserId: string): Promise<Model>;
}
