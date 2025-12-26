import { IsOptional, IsEmail, MinLength } from 'class-validator';

export class CreateUserDto {
  firstName: string;
  lastName: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  firstName?: string;

  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  profilePicture?: string;

  @IsOptional()
  status?: string;
}
