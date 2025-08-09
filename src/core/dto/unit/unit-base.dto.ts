import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DefaultUnitDto {
  @ApiProperty()
  @IsNotEmpty()
  rfid: string;

  @ApiProperty()
  @IsNotEmpty()
  chassisNo: string;

  @ApiProperty()
  @IsNotEmpty()
  color: string;

  @ApiProperty()
  @IsNotEmpty()
  description: string;
  
  @ApiProperty()
  @IsNotEmpty()
  modelId: string;
  
  @ApiProperty()
  @IsNotEmpty()
  locationId: string;
}
