import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { DefaultScannerDto } from "./scanner-base.dto";

export class UpdateScannerDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: "Scanner code must be a string" })
  scannerCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: "Scanner name must be a string" })
  name?: string;

  @ApiPropertyOptional({ 
    enum: ['LOCATION', 'REGISTRATION'],
    description: "Scanner type: LOCATION or REGISTRATION"
  })
  @IsOptional()
  @IsIn(['LOCATION', 'REGISTRATION'], { 
    message: "Scanner type must be either 'LOCATION' or 'REGISTRATION'" 
  })
  scannerType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: "Location ID must be a string" })
  locationId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: "Status ID must be a string" })
  statusId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ message: "Assigned employee user ID must be a string" })
  assignedEmployeeUserId?: string;

  @ApiPropertyOptional({ description: "Active status" })
  @IsOptional()
  active?: boolean;
}