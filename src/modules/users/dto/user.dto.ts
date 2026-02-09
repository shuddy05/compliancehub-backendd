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

// Response DTO to prevent circular references
export class CompanyResponseDto {
  id: string;
  name: string;
  industry?: string;
  employeeCount?: number;
  subscriptionTier?: string;
  subscriptionStatus?: string;
}

export class CompanyUserResponseDto {
  id: string;
  companyId: string;
  role: string;
  isPrimaryCompany: boolean;
  isActive: boolean;
  company: CompanyResponseDto;
}

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  preferredLanguage: string;
  darkModeEnabled: boolean;
  onboardingCompleted: boolean;
  onboardingStep: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  companyUsers: CompanyUserResponseDto[];
}
