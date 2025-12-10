// src/core/dto/statistics/statistics.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsArray, ValidateNested, IsDateString, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';

export enum TimeframeType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM'
}

export class TimeframeDto {
  @ApiProperty({ 
    enum: TimeframeType, 
    default: TimeframeType.DAILY,
    example: TimeframeType.DAILY 
  })
  @IsEnum(TimeframeType)
  type: TimeframeType;

  @ApiProperty({ 
    required: false, 
    example: "2025-12-01",
    description: 'Required only when type is CUSTOM'
  })
  @ValidateIf(o => o.type === TimeframeType.CUSTOM)
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ 
    required: false, 
    example: "2025-12-31",
    description: 'Required only when type is CUSTOM'
  })
  @ValidateIf(o => o.type === TimeframeType.CUSTOM)
  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class StatisticsFilterDto {
  @ApiProperty({ type: TimeframeDto })
  @ValidateNested()
  @Type(() => TimeframeDto)
  timeframe: TimeframeDto;

  @ApiProperty({ 
    required: false, 
    type: [String], 
    example: ["WAREHOUSE_5"]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locationIds?: string[];

  @ApiProperty({ 
    required: false, 
    type: [String], 
    example: ["1", "2"]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  modelIds?: string[];

  @ApiProperty({ 
    required: false, 
    type: [String], 
    example: ["DELIVERED", "HOLD"]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  statusNames?: string[];

  @ApiProperty({ 
    required: false, 
    type: [String], 
    example: ["WHITE", "BLACK"]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  colors?: string[];
}