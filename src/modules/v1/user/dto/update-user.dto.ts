import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lastName?: string;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  emailVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  @IsNotEmpty()
  mobileVerified?: boolean;

  @IsOptional()
  @IsPhoneNumber()
  @IsNotEmpty()
  mobileNumber?: string;
}
