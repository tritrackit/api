import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { DefaultModelDto } from "./model-base.dto";

export class CreateModelDto extends DefaultModelDto {
}