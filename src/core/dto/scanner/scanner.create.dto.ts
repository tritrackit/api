// src/core/dto/scanner/scanner.create.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { DefaultScannerDto } from "./scanner-base.dto";

export class CreateScannerDto extends DefaultScannerDto {
  // Override to make scannerType required for creation
  @ApiProperty({
    description: "Scanner type - REGISTRATION or LOCATION",
    enum: ["REGISTRATION", "LOCATION"],
    required: true,
    example: "LOCATION"
  })
  @IsNotEmpty({ message: "scannerType is required" })
  override scannerType: "REGISTRATION" | "LOCATION"; // Use override keyword
}