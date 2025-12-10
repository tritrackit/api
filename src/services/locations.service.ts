import { Locations } from "src/db/entities/Locations";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { 
  LOCATIONS_ERROR_NOT_FOUND,
  FIXED_LOCATIONS,
  FIXED_LOCATION_IDS 
} from "src/common/constant/locations.constant";
import {
  columnDefToTypeORMCondition,
} from "src/common/utils/utils";
import { In, Repository } from "typeorm";
import { CacheKeys } from "src/common/constant/cache.constant";
import { CacheService } from "./cache.service";

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Locations)
    private readonly locationsRepo: Repository<Locations>,
    private readonly cacheService: CacheService
  ) {}

  async getPagination({ pageSize, pageIndex, order, columnDef }) {
    const key = CacheKeys.locations.list(
      pageSize,
      pageIndex,
      JSON.stringify(order),
      JSON.stringify(columnDef)
    );
    const cached = this.cacheService.get<{
      results: Locations[];
      total: number;
    }>(key);
    if (cached) return cached;

    const skip = Number(pageIndex) > 0 ? Number(pageIndex) * Number(pageSize) : 0;
    const take = Number(pageSize);

    const condition = columnDefToTypeORMCondition(columnDef);
    
    // Only return fixed locations
    const fixedLocationCondition = {
      locationId: In(FIXED_LOCATION_IDS),
      active: true
    };

    const [results, total] = await Promise.all([
      this.locationsRepo.find({
        where: {
          ...condition,
          ...fixedLocationCondition,
        },
        relations: {
          createdBy: true,
          updatedBy: true,
        },
        skip,
        take,
        order,
      }),
      this.locationsRepo.count({
        where: {
          ...condition,
          ...fixedLocationCondition,
        },
      }),
    ]);
    
    const response = {
      results: results.map((x) => {
        delete x?.createdBy?.password;
        delete x?.createdBy?.refreshToken;
        delete x?.updatedBy?.password;
        delete x?.updatedBy?.refreshToken;
        return x;
      }),
      total,
    };
    this.cacheService.set(key, response);
    return response;
  }

  async getById(locationId) {
    // Validate it's a fixed location
    if (!FIXED_LOCATION_IDS.includes(locationId)) {
      throw Error(LOCATIONS_ERROR_NOT_FOUND);
    }

    const key = CacheKeys.locations.byId(locationId);
    const cached = this.cacheService.get<Locations>(key);
    if (cached) return cached;

    const result = await this.locationsRepo.findOne({
      where: {
        locationId,
        active: true,
      },
      relations: {
        createdBy: true,
        updatedBy: true,
      },
    });
    if (!result) {
      throw Error(LOCATIONS_ERROR_NOT_FOUND);
    }
    delete result.createdBy.password;
    if (result?.updatedBy?.password) {
      delete result.updatedBy.password;
    }
    delete result?.createdBy?.password;
    delete result?.createdBy?.refreshToken;
    delete result?.updatedBy?.password;
    delete result?.updatedBy?.refreshToken;
    this.cacheService.set(key, result);
    return result;
  }

  // Helper to get specific fixed location
  async getFixedLocation(locationType: keyof typeof FIXED_LOCATIONS) {
    const fixedLocation = FIXED_LOCATIONS[locationType];
    
    const location = await this.locationsRepo.findOne({
      where: { 
        locationId: fixedLocation.id,
        active: true 
      }
    });
    
    if (!location) {
      throw Error(`Fixed location "${fixedLocation.name}" not found. Run system reset.`);
    }
    
    return location;
  }

  // Get all fixed locations for dropdown
  async getAllFixedLocations() {
    return await this.locationsRepo.find({
      where: {
        locationId: In(FIXED_LOCATION_IDS),
        active: true
      },
      order: { name: 'ASC' }
    });
  }

  // Helper for UnitsService - get Open Area location
  async getOpenArea() {
    return await this.getFixedLocation('OPEN_AREA');
  }

  // Helper for UnitsService - get Warehouse 5 location
  async getWarehouse5() {
    return await this.getFixedLocation('WAREHOUSE_5');
  }
}