import { IsUUID, IsIn, IsOptional, IsEmail, IsString } from 'class-validator';

export class InitiatePaymentDto {
  @IsUUID()
  companyId: string;

  @IsIn(['pro', 'enterprise', 'free'])
  planName: string; // 'pro' | 'enterprise' | 'free'

  @IsIn(['monthly', 'annual', 'annually'])
  billingCycle: string; // 'monthly' | 'annually'

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerFirstName?: string;

  @IsOptional()
  @IsString()
  customerLastName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;
}
