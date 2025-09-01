import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class DefaultScannerDto {
  @ApiProperty({
    description:
      "Must start with an uppercase letter or number. Can only include letters, numbers, underscore (_) or dash (-). No spaces. Max 20 characters.",
    example: "SCAN_001",
  })
  @IsNotEmpty()
  @MaxLength(20, { message: "scannerCode must not exceed 20 characters" })
  @MinLength(3, { message: "scannerCode must be at least 3 characters" })
  @Matches(/^(?=.{1,20}$)([A-Z][A-Za-z0-9_-]*|[0-9][A-Za-z0-9_-]*)$/, {
    message:
      "Invalid value, scanner code must start with an uppercase letter or a number, and only contain letters, numbers, underscore (_) or dash (-) with no spaces, max 20 characters",
  })
  scannerCode: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  assignedEmployeeUserId: string;
  
  @ApiProperty()
  @IsNotEmpty()
  statusId: string;

  @ApiProperty()
  @IsNotEmpty()
  locationId: string;
}
