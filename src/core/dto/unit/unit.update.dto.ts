import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString, IsOptional } from "class-validator";
import { DefaultUnitDto } from "./unit-base.dto";

export class UpdateUnitDto extends DefaultUnitDto {
  @ApiProperty({ required: false })
  @IsOptional()
  locationId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  statusId?: string;
}