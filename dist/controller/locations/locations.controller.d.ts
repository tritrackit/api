import { ApiResponseModel } from "src/core/models/api-response.model";
import { Locations } from "src/db/entities/Locations";
import { LocationsService } from "src/services/locations.service";
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getById(locationId: string): Promise<ApiResponseModel<Locations>>;
    getPaginated(params?: {
        pageSize: string;
        pageIndex: string;
        order: any;
        columnDef: any[];
    }): Promise<ApiResponseModel<{
        results: Locations[];
        total: number;
    }>>;
    getAllFixedLocations(): Promise<ApiResponseModel<Locations[]>>;
    createDisabled(): Promise<ApiResponseModel<any>>;
    updateDisabled(locationId: string, dto: any, userId: string): Promise<ApiResponseModel<any>>;
    deleteDisabled(locationId: string, userId: string): Promise<ApiResponseModel<any>>;
}
