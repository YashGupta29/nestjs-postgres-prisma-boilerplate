import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  ValidateIf,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ValidateIf((obj, _) => !obj.mobileNumber)
  email?: string;

  @IsPhoneNumber()
  @IsNotEmpty()
  @ValidateIf((obj, _) => !obj.email)
  mobileNumber?: string;
}
