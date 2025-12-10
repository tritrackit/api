import { ApiResponseModel } from "src/core/models/api-response.model";
import { Repository } from "typeorm";
import { Locations } from "src/db/entities/Locations";
import { Status } from "src/db/entities/Status";
import { Model } from "src/db/entities/Model";
export declare class MetadataController {
    private locationsRepo;
    private statusRepo;
    private modelRepo;
    constructor(locationsRepo: Repository<Locations>, statusRepo: Repository<Status>, modelRepo: Repository<Model>);
    getLocations(): Promise<ApiResponseModel<any>>;
    getStatuses(): Promise<ApiResponseModel<any>>;
    getModels(): Promise<ApiResponseModel<any>>;
    getColors(): Promise<ApiResponseModel<any>>;
    getAllFilters(): Promise<ApiResponseModel<any>>;
}
