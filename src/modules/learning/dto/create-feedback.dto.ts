import { IsUUID, IsBoolean, IsString, IsOptional } from 'class-validator';

export class CreateFeedbackDto {
  @IsUUID()
  contentId: string;

  @IsBoolean()
  helpful: boolean;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;
}
