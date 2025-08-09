import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsUppercase,
  ValidateNested,
} from "class-validator";
import moment from "moment";

export class DefaultEmployeeUserDto {
  @ApiProperty()
  @IsNotEmpty({
    message: "Not allowed, firstname is required!"
  })
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({
    message: "Not allowed, lastname is required!"
  })
  lastName: string;

  @ApiProperty()
  @IsNotEmpty({
    message: "Not allowed, email is required!"
  })
  email: string;

  @ApiProperty()
  @IsNotEmpty({
    message: "Not allowed, email is required!"
  })
  contactNo: string;
}

export class UpdateProfilePictureDto {
  @ApiProperty()
  @IsOptional()
  userProfilePic: any;
}