import { Locations } from "src/db/entities/Locations";
import { CreateLocationsDto } from "src/core/dto/locations/locations.create.dto";
import { UpdateLocationsDto } from "src/core/dto/locations/locations.update.dto";
import { Repository } from "typeorm";
export declare class LocationsService {
    private readonly locationsRepo;
    constructor(locationsRepo: Repository<Locations>);
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
    create(dto: CreateLocationsDto, createdByUserId: string): Promise<Locations>;
    update(locationId: any, dto: UpdateLocationsDto, updatedByUserId: string): Promise<Locations>;
    delete(locationId: any, updatedByUserId: string): Promise<Locations>;
}
