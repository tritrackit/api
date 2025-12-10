// src/controllers/metadata.controller.ts
import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApiResponseModel } from "src/core/models/api-response.model";
import { JwtAuthGuard } from "src/core/auth/jwt-auth.guard";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Locations } from "src/db/entities/Locations";
import { Status } from "src/db/entities/Status";
import { Model } from "src/db/entities/Model";

@ApiTags("metadata")
@Controller("metadata")
@ApiBearerAuth("jwt")
export class MetadataController {
  constructor(
    @InjectRepository(Locations)
    private locationsRepo: Repository<Locations>,
    @InjectRepository(Status)
    private statusRepo: Repository<Status>,
    @InjectRepository(Model)
    private modelRepo: Repository<Model>,
  ) {}

  @Get("locations")
  @UseGuards(JwtAuthGuard)
  async getLocations() {
    const res = {} as ApiResponseModel<any>;
    try {
      res.data = await this.locationsRepo.find({
        where: { active: true },
        select: ['locationId', 'name', 'locationCode'],
        order: { name: 'ASC' }
      });
      res.success = true;
      res.message = "Locations retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  @Get("statuses")
  @UseGuards(JwtAuthGuard)
  async getStatuses() {
    const res = {} as ApiResponseModel<any>;
    try {
      res.data = await this.statusRepo.find({
        select: ['statusId', 'name'],
        order: { name: 'ASC' }
      });
      res.success = true;
      res.message = "Statuses retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  @Get("models")
  @UseGuards(JwtAuthGuard)
  async getModels() {
    const res = {} as ApiResponseModel<any>;
    try {
      res.data = await this.modelRepo.find({
        where: { active: true },
        select: ['modelId', 'modelName'],
        order: { modelName: 'ASC' }
      });
      res.success = true;
      res.message = "Models retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  @Get("colors")
  @UseGuards(JwtAuthGuard)
  async getColors() {
    const res = {} as ApiResponseModel<any>;
    try {
      const colors = await this.modelRepo.manager
        .createQueryBuilder()
        .select('DISTINCT unit.color', 'color')
        .from('Units', 'unit')
        .where('unit.active = :active', { active: true })
        .andWhere('unit.color IS NOT NULL')
        .andWhere('unit.color != :empty', { empty: '' })
        .orderBy('unit.color', 'ASC')
        .getRawMany();

      res.data = colors.map(item => item.color).filter(color => color);
      res.success = true;
      res.message = "Colors retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }

  @Get("filters/all")
  @UseGuards(JwtAuthGuard)
  async getAllFilters() {
    const res = {} as ApiResponseModel<any>;
    try {
      // Get all filter options in parallel
      const [locations, statuses, models, colors] = await Promise.all([
        this.locationsRepo.find({
          where: { active: true },
          select: ['locationId', 'name', 'locationCode'],
          order: { name: 'ASC' }
        }),
        this.statusRepo.find({
          select: ['statusId', 'name'],
          order: { name: 'ASC' }
        }),
        this.modelRepo.find({
          where: { active: true },
          select: ['modelId', 'modelName'],
          order: { modelName: 'ASC' }
        }),
        this.modelRepo.manager
          .createQueryBuilder()
          .select('DISTINCT unit.color', 'color')
          .from('Units', 'unit')
          .where('unit.active = :active', { active: true })
          .andWhere('unit.color IS NOT NULL')
          .andWhere('unit.color != :empty', { empty: '' })
          .orderBy('unit.color', 'ASC')
          .getRawMany()
      ]);

      res.data = {
        locations,
        statuses,
        models,
        colors: colors.map(item => item.color),
        timeframeOptions: [
          { value: 'DAILY', label: 'Today' },
          { value: 'WEEKLY', label: 'This Week' },
          { value: 'MONTHLY', label: 'This Month' },
          { value: 'QUARTERLY', label: 'This Quarter' },
          { value: 'YEARLY', label: 'This Year' },
          { value: 'CUSTOM', label: 'Custom Range' }
        ]
      };
      
      res.success = true;
      res.message = "All filter options retrieved successfully";
      return res;
    } catch (e) {
      res.success = false;
      res.message = e.message !== undefined ? e.message : String(e);
      return res;
    }
  }
}