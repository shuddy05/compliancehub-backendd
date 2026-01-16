import { IsString, IsOptional, Allow } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @Allow()
  name: string;

  @IsOptional()
  @IsString()
  @Allow()
  tin?: string;

  @IsOptional()
  @IsString()
  @Allow()
  rcNumber?: string;

  @IsOptional()
  @IsString()
  @Allow()
  industry?: string;

  @IsOptional()
  @IsString()
  @Allow()
  address?: string;

  @IsOptional()
  @IsString()
  @Allow()
  state?: string;

  @IsOptional()
  @IsString()
  @Allow()
  lga?: string;

  @IsOptional()
  @IsString()
  @Allow()
  phone?: string;

  @IsOptional()
  @IsString()
  @Allow()
  email?: string;

  @IsOptional()
  @IsString()
  @Allow()
  defaultCurrency?: string = 'NGN';

  @IsOptional()
  @IsString()
  @Allow()
  timezone?: string = 'Africa/Lagos';
}
