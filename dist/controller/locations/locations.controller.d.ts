import { CreateLocationsDto } from "src/core/dto/locations/locations.create.dto";
import { UpdateLocationsDto } from "src/core/dto/locations/locations.update.dto";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { Locations } from "src/db/entities/Locations";
import { LocationsService } from "src/services/locations.service";
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getById(locationsId: string): Promise<ApiResponseModel<Locations>>;
    getPaginated(params?: {
        pageSize: string;
        pageIndex: string;
        order: any;
        columnDef: any[];
    }): Promise<ApiResponseModel<{
        results: Locations[];
        total: number;
    }>>;
    create(accessDto: CreateLocationsDto, userId: string): Promise<ApiResponseModel<Locations>>;
    update(locationsId: string, dto: UpdateLocationsDto, userId: string): Promise<ApiResponseModel<Locations>>;
    delete(locationsId: string, userId: string): Promise<ApiResponseModel<Locations>>;
}
