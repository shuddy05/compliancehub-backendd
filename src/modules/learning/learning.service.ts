import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningContent } from '../../database/entities/learning-content.entity';
import { LearningBookmark } from '../../database/entities/learning-bookmark.entity';
import { LearningFeedback } from '../../database/entities/learning-feedback.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { LearningContentResponseDto } from './dto/learning-content-response.dto';
import { slugify } from '../../common/utils/slugify';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(LearningContent)
    private learningRepository: Repository<LearningContent>,
    @InjectRepository(LearningBookmark)
    private bookmarkRepository: Repository<LearningBookmark>,
    @InjectRepository(LearningFeedback)
    private feedbackRepository: Repository<LearningFeedback>,
  ) {}

  // Clean HTML by removing data attributes used by the editor
  private cleanHtml(html: string): string {
    if (!html) return html;
    // Remove data-start and data-end attributes from HTML elements
    return html.replace(/\s+data-(start|end)="[^"]*"/g, '');
  }

  // Convert YouTube URL to embeddable iframe URL
  private convertToEmbedUrl(url: string): string {
    if (!url) return url;
    
    // Already an embed URL
    if (url.includes('youtube.com/embed/')) return url;
    
    // Extract video ID from various YouTube URL formats
    let videoId = '';
    
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (watchMatch) {
      videoId = watchMatch[1];
    }
    
    // Format: https://youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/youtube\.com\/embed\/([^?&\n#]+)/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
    
    // If we found a video ID, convert to embed URL
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // If not YouTube or already in proper format, return as-is
    return url;
  }

  // Map entity to response DTO
  private mapToResponse(entity: LearningContent): LearningContentResponseDto {
    return {
      id: entity.id,
      title: entity.title,
      type: entity.contentType as any,
      category: entity.category,
      difficulty: entity.difficultyLevel
        ? (entity.difficultyLevel.charAt(0).toUpperCase() + entity.difficultyLevel.slice(1)) as any
        : 'Beginner',
      duration: entity.duration,
      description: entity.description || entity.body,
      thumbnail: entity.thumbnail,
      featured: entity.featured,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      body: entity.body,
      videoUrl: this.convertToEmbedUrl(entity.videoUrl),
      isPublished: entity.isPublished,
      viewCount: entity.viewCount,
      helpfulCount: entity.helpfulCount,
      tags: entity.tags,
      publishedAt: entity.publishedAt,
    };
  }

  async createContent(createContentDto: CreateContentDto, userId: string) {
    // Generate slug from title
    const slug = slugify(createContentDto.title);

    // Map difficulty level
    const difficultyMap = {
      'Beginner': 'beginner',
      'Intermediate': 'intermediate',
      'Advanced': 'advanced',
    };

    // Map content type
    const contentType = createContentDto.type;

    // Prepare body based on content type
    let body = '';
    if (contentType === 'article' && createContentDto.articleContent) {
      body = createContentDto.articleContent;
    } else if (contentType === 'checklist' && createContentDto.checklistItems) {
      body = JSON.stringify(createContentDto.checklistItems);
    }

    const learningContent = new LearningContent();
    learningContent.title = createContentDto.title;
    learningContent.slug = slug;
    learningContent.contentType = contentType;
    if (createContentDto.category) learningContent.category = createContentDto.category;
    // Clean HTML description by removing editor data attributes
    if (createContentDto.description) learningContent.description = this.cleanHtml(createContentDto.description);
    if (createContentDto.duration) learningContent.duration = createContentDto.duration;
    if (createContentDto.thumbnail) learningContent.thumbnail = createContentDto.thumbnail;
    learningContent.body = body;
    if (createContentDto.videoUrl) learningContent.videoUrl = createContentDto.videoUrl;
    learningContent.difficultyLevel = difficultyMap[createContentDto.difficulty] || 'beginner';
    if (createContentDto.readingTime) learningContent.estimatedReadTime = parseInt(createContentDto.readingTime);
    if (createContentDto.tags) learningContent.tags = createContentDto.tags;
    learningContent.authorId = userId;
    learningContent.isPublished = false;
    learningContent.featured = false;

    const saved = await this.learningRepository.save(learningContent);
    return this.mapToResponse(saved);
  }

  async getAllContent(filters?: { published?: boolean; category?: string; difficulty?: string; skip?: number; take?: number }) {
    const query = this.learningRepository.createQueryBuilder('content');

    if (filters?.published) {
      query.where('content.isPublished = :published', { published: filters.published });
    }

    if (filters?.category) {
      query.andWhere('content.category = :category', { category: filters.category });
    }

    if (filters?.difficulty) {
      query.andWhere('content.difficultyLevel = :difficulty', { difficulty: filters.difficulty });
    }

    const skip = filters?.skip || 0;
    const take = filters?.take || 100;

    const items = await query.orderBy('content.createdAt', 'DESC').skip(skip).take(take).getMany();
    return items.map(item => this.mapToResponse(item));
  }

  async getContentById(id: string) {
    const content = await this.learningRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    return content ? this.mapToResponse(content) : null;
  }

  async updateContent(id: string, updateContentDto: Partial<CreateContentDto>) {
    const content = await this.learningRepository.findOne({ where: { id } });
    if (!content) {
      throw new Error('Content not found');
    }

    // Update fields
    if (updateContentDto.title) {
      content.title = updateContentDto.title;
      content.slug = slugify(updateContentDto.title);
    }

    if (updateContentDto.category) {
      content.category = updateContentDto.category;
    }

    if (updateContentDto.description) {
      content.description = this.cleanHtml(updateContentDto.description);
    }

    if (updateContentDto.duration) {
      content.duration = updateContentDto.duration;
    }

    if (updateContentDto.thumbnail) {
      content.thumbnail = updateContentDto.thumbnail;
    }

    if (updateContentDto.difficulty) {
      const difficultyMap = {
        'Beginner': 'beginner',
        'Intermediate': 'intermediate',
        'Advanced': 'advanced',
      };
      content.difficultyLevel = difficultyMap[updateContentDto.difficulty] || 'beginner';
    }

    if (updateContentDto.articleContent) {
      content.body = updateContentDto.articleContent;
    }

    if (updateContentDto.videoUrl) {
      content.videoUrl = updateContentDto.videoUrl;
    }

    if (updateContentDto.tags) {
      content.tags = updateContentDto.tags;
    }

    const updated = await this.learningRepository.save(content);
    return this.mapToResponse(updated);
  }

  async deleteContent(id: string) {
    return this.learningRepository.delete(id);
  }

  async publishContent(id: string) {
    const content = await this.learningRepository.findOne({ where: { id } });
    if (!content) {
      throw new Error('Content not found');
    }

    content.isPublished = true;
    content.publishedAt = new Date();
    const published = await this.learningRepository.save(content);
    return this.mapToResponse(published);
  }

  async getStats() {
    const total = await this.learningRepository.count();
    const published = await this.learningRepository.count({ where: { isPublished: true } });
    const draft = total - published;

    const contentByType = await this.learningRepository
      .createQueryBuilder('content')
      .select('content.contentType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('content.contentType')
      .getRawMany();

    return {
      total,
      published,
      draft,
      byType: contentByType.map(item => ({
        type: item.type,
        count: parseInt(item.count),
      })),
    };
  }

  async setFeatured(id: string, featured: boolean) {
    const content = await this.learningRepository.findOne({ where: { id } });
    if (!content) {
      throw new Error('Content not found');
    }

    content.featured = featured;
    const updated = await this.learningRepository.save(content);
    return this.mapToResponse(updated);
  }

  // Bookmark operations
  async addBookmark(createBookmarkDto: CreateBookmarkDto, userId: string) {
    const { contentId, companyId } = createBookmarkDto;
    
    // Check if content exists
    const content = await this.learningRepository.findOne({ where: { id: contentId } });
    if (!content) {
      throw new Error('Content not found');
    }

    // Check if bookmark already exists
    const whereCondition: any = { userId, contentId };
    if (companyId) {
      whereCondition.companyId = companyId;
    }

    const existing = await this.bookmarkRepository.findOne({
      where: whereCondition,
    });

    if (existing) {
      return { message: 'Already bookmarked', id: existing.id };
    }

    const bookmark = this.bookmarkRepository.create({
      userId,
      contentId,
      companyId,
    });

    const saved = await this.bookmarkRepository.save(bookmark);
    return { message: 'Bookmarked successfully', id: saved.id };
  }

  async removeBookmark(contentId: string, userId: string) {
    const result = await this.bookmarkRepository.delete({ userId, contentId });
    return { message: 'Bookmark removed', affected: result.affected };
  }

  async getBookmarks(userId: string, companyId?: string) {
    const query = this.bookmarkRepository
      .createQueryBuilder('bookmark')
      .leftJoinAndSelect('bookmark.content', 'content')
      .where('bookmark.userId = :userId', { userId });

    if (companyId) {
      query.andWhere('bookmark.companyId = :companyId', { companyId });
    }

    const bookmarks = await query.orderBy('bookmark.createdAt', 'DESC').getMany();
    return bookmarks.map(b => this.mapToResponse(b.content));
  }

  async isBookmarked(contentId: string, userId: string): Promise<boolean> {
    const bookmark = await this.bookmarkRepository.findOne({
      where: { userId, contentId },
    });
    return !!bookmark;
  }

  // Feedback operations
  async addFeedback(createFeedbackDto: CreateFeedbackDto, userId: string) {
    const { contentId, helpful, comment, companyId } = createFeedbackDto;

    // Check if content exists
    const content = await this.learningRepository.findOne({ where: { id: contentId } });
    if (!content) {
      throw new Error('Content not found');
    }

    // Check if feedback already exists and update it
    const existing = await this.feedbackRepository.findOne({
      where: { userId, contentId },
    });

    if (existing) {
      existing.helpful = helpful;
      if (comment) {
        existing.comment = comment;
      }
      const updated = await this.feedbackRepository.save(existing);
      return { message: 'Feedback updated', id: updated.id };
    }

    // Create new feedback
    const feedback = this.feedbackRepository.create({
      userId,
      contentId,
      helpful,
      comment,
      companyId,
    });

    const saved = await this.feedbackRepository.save(feedback);
    return { message: 'Feedback submitted', id: saved.id };
  }

  async getFeedback(contentId: string) {
    const feedbacks = await this.feedbackRepository.find({
      where: { contentId },
    });

    const helpful = feedbacks.filter(f => f.helpful).length;
    const notHelpful = feedbacks.filter(f => !f.helpful).length;

    return {
      contentId,
      totalFeedback: feedbacks.length,
      helpful,
      notHelpful,
      helpfulPercentage: feedbacks.length > 0 ? (helpful / feedbacks.length * 100).toFixed(2) : 0,
    };
  }

  async getUserFeedback(contentId: string, userId: string) {
    return this.feedbackRepository.findOne({
      where: { userId, contentId },
    });
  }
}
