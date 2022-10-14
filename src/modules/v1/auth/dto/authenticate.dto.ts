import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';

export class AuthenticateDto {
  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((obj, val) => !obj.mobileNumber)
  email?: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @ValidateIf((obj, val) => !obj.email)
  mobileNumber?: string;
}
