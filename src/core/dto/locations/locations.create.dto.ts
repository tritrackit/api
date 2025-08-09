import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString } from "class-validator";
import { DefaultLocationsDto } from "./locations-base.dto";

export class CreateLocationsDto extends DefaultLocationsDto {
}
