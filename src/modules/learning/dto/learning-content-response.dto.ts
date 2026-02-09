export class LearningContentResponseDto {
  id: string;
  title: string;
  type: 'video' | 'article' | 'checklist' | 'faq'; // Maps from contentType
  category?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'; // Maps from difficultyLevel
  duration?: string;
  description?: string;
  thumbnail?: string;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Additional fields
  body?: string;
  videoUrl?: string;
  isPublished?: boolean;
  viewCount?: number;
  helpfulCount?: number;
  tags?: string[];
  publishedAt?: Date;
}
