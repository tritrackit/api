import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumberString } from "class-validator";
import { DefaultScannerDto } from "./scanner-base.dto";

export class CreateScannerDto extends DefaultScannerDto {
  @ApiProperty()
  @IsNotEmpty()
  statusId: string;
}
