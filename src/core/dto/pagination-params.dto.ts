import { Transform } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsObject,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsArrayOfArrays } from "./array-constraint.dto";

export class PaginationParamsDto {
  @ApiProperty({
    default: 10,
  })
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key].toString();
  })
  pageSize: string;

  @ApiProperty({
    default: 0,
  })
  @IsNotEmpty()
  @IsNumberString()
  @Transform(({ obj, key }) => {
    return obj[key].toString();
  })
  pageIndex: string;

  @ApiProperty({})
  @IsNotEmpty()
  order = {} as any;

  @ApiProperty({
    isArray: true,
    default: [],
    description: "An array of arrays containing arbitrary objects.",
  })
  @IsArray()
  columnDef: any[] = [];
}
