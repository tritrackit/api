import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  ValidateNested,
} from "class-validator";

export class ScannerLogDto {
  @ApiProperty({
    type: String,
    description: "The scanner Code",
  })
  @IsNotEmpty()
  scannerCode: string;

  @ApiProperty({
    type: Date,
    description: "The timestamp of the log",
  })
  @IsNotEmpty()
  timestamp: Date;

  @ApiProperty({
    type: String,
    description: "The RFID of the scanned item",
  })
  @IsNotEmpty()
  rfid: string;
}

export class LogsDto {
  @ApiProperty({
    isArray: true,
    type: ScannerLogDto,
    description: "Array of scanner logs",
    example: [
      {
        rfid: "ABC1234567",
        scannerCode: "123456",
        timestamp: "2025-08-06T14:00:00Z",
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true }) // ✅ FIXED
  @Type(() => ScannerLogDto)
  data: ScannerLogDto[] = [];
}
