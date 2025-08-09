import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, Matches, MaxLength, MinLength } from "class-validator";

export class DefaultLocationsDto {
  @ApiProperty({
    description:
      "Must start with an uppercase letter or number. Can only include letters, numbers, underscore (_) or dash (-). No spaces. Max 15 characters.",
    example: "A1_MainBranch",
  })
  @IsNotEmpty()
  @MaxLength(15, { message: "locationCode must not exceed 15 characters" })
  @MinLength(3, { message: "locationCode must be at least 3 characters" })
  @Matches(/^(?=.{1,15}$)([A-Z][A-Za-z0-9_-]*|[0-9][A-Za-z0-9_-]*)$/, {
    message:
      "locationCode must start with an uppercase letter or a number, and only contain letters, numbers, underscore (_) or dash (-) with no spaces, max 15 characters",
  })
  locationCode: string;

  @ApiProperty()
  @IsNotEmpty()
  name: string;
}
