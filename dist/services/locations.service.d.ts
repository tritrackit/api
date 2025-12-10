import { Locations } from "src/db/entities/Locations";
import { FIXED_LOCATIONS } from "src/common/constant/locations.constant";
import { Repository } from "typeorm";
import { CacheService } from "./cache.service";
export declare class LocationsService {
    private readonly locationsRepo;
    private readonly cacheService;
    constructor(locationsRepo: Repository<Locations>, cacheService: CacheService);
    getPagination({ pageSize, pageIndex, order, columnDef }: {
        pageSize: any;
        pageIndex: any;
        order: any;
        columnDef: any;
    }): Promise<{
        results: Locations[];
        total: number;
    }>;
    getById(locationId: any): Promise<Locations>;
    getFixedLocation(locationType: keyof typeof FIXED_LOCATIONS): Promise<Locations>;
    getAllFixedLocations(): Promise<Locations[]>;
    getOpenArea(): Promise<Locations>;
    getWarehouse5(): Promise<Locations>;
}
