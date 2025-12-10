// src/modules/statistics.module.ts
import { Module } from "@nestjs/common";
import { StatisticsController } from "./statistics.controller";
import { MetadataController } from "../meta-data/metadata.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Units } from "src/db/entities/Units";
import { UnitLogs } from "src/db/entities/UnitLogs";
import { Locations } from "src/db/entities/Locations";
import { Status } from "src/db/entities/Status";
import { Model } from "src/db/entities/Model";
import { StatisticsService } from "src/services/statistics.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Units,
      UnitLogs,
      Locations,
      Status,
      Model
    ])
  ],
  controllers: [StatisticsController, MetadataController],
  providers: [StatisticsService],
  exports: [StatisticsService, TypeOrmModule], // Export TypeOrmModule for MetadataController
})
export class StatisticsModule {}