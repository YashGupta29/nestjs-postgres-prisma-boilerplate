import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';

export class VerifyDto {
  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((obj, _) => !obj.mobileNumber)
  email?: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @ValidateIf((obj, _) => !obj.email)
  mobileNumber?: string;

  @IsNumberString()
  @IsNotEmpty()
  code: string;
}
