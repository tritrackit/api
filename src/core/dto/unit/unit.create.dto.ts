import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString } from "class-validator";
import { DefaultUnitDto } from "./unit-base.dto";

export class CreateUnitDto extends DefaultUnitDto {
  @ApiProperty()
  @IsNotEmpty()
  locationId: string;
}
