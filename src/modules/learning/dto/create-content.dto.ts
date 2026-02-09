import { IsString, IsOptional, IsEnum, IsNumber, IsArray } from 'class-validator';

export enum ContentType {
  ARTICLE = 'article',
  VIDEO = 'video',
  CHECKLIST = 'checklist',
  FAQ = 'faq',
}

export enum DifficultyLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced',
}

export class CreateContentDto {
  @IsString()
  title: string;

  @IsEnum(ContentType)
  type: ContentType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsEnum(DifficultyLevel)
  difficulty: DifficultyLevel;

  @IsString()
  duration: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  // Article specific
  @IsOptional()
  @IsString()
  articleContent?: string;

  @IsOptional()
  @IsNumber()
  wordCount?: number;

  @IsOptional()
  @IsString()
  readingTime?: string;

  // Video specific
  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  videoSource?: 'youtube' | 'vimeo' | 'url';

  // Checklist specific
  @IsOptional()
  @IsArray()
  checklistItems?: Array<{ title: string; description?: string }>;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  featured?: boolean;
}
