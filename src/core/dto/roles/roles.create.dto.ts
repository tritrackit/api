import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { DefaultRoleDto } from "./roles-base.dto";

export class CreateRoleDto extends DefaultRoleDto {
}