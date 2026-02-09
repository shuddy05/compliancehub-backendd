import { IsUUID, IsOptional } from 'class-validator';

export class CreateBookmarkDto {
  @IsUUID()
  contentId: string;

  @IsUUID()
  @IsOptional()
  companyId?: string;
}
