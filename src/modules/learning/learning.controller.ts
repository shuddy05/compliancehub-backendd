import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  Request,
  Query,
  HttpCode,
  HttpStatus,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as express from 'express';
import { LearningService } from './learning.service';
import { CreateContentDto } from './dto/create-content.dto';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('learning')
export class LearningController {
  constructor(private learningService: LearningService) {}

  /**
   * Create new learning content
   * POST /api/v1/learning/content
   */
  @Post('content')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createContent(@Body() createContentDto: CreateContentDto, @Request() req: any) {
    return this.learningService.createContent(createContentDto, req.user.id);
  }

  /**
   * Get all learning content with optional filters
   * GET /api/v1/learning/content?published=true&category=tax_basics&difficulty=beginner
   */
  @Get('content')
  async getAllContent(
    @Query('published') published?: string,
    @Query('category') category?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    const filters = {
      published: published === 'true',
      category,
      difficulty,
    };
    return this.learningService.getAllContent(filters);
  }

  /**
   * Get single content by ID
   * GET /api/v1/learning/content/:id
   */
  @Get('content/:id')
  async getContentById(@Param('id') id: string) {
    return this.learningService.getContentById(id);
  }

  /**
   * Update content
   * PUT /api/v1/learning/content/:id
   */
  @Put('content/:id')
  @UseGuards(JwtAuthGuard)
  async updateContent(
    @Param('id') id: string,
    @Body() updateContentDto: Partial<CreateContentDto>,
  ) {
    return this.learningService.updateContent(id, updateContentDto);
  }

  /**
   * Delete content
   * DELETE /api/v1/learning/content/:id
   */
  @Delete('content/:id')
  @UseGuards(JwtAuthGuard)
  async deleteContent(@Param('id') id: string) {
    await this.learningService.deleteContent(id);
    return { message: 'Content deleted successfully' };
  }

  /**
   * Publish content
   * POST /api/v1/learning/content/:id/publish
   */
  @Post('content/:id/publish')
  @UseGuards(JwtAuthGuard)
  async publishContent(@Param('id') id: string) {
    return this.learningService.publishContent(id);
  }

  /**
   * Upload thumbnail for content
   * POST /api/v1/learning/upload-thumbnail
   */
  @Post('upload-thumbnail')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/learning-thumbnails',
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const filename = `${timestamp}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    }),
  )
  async uploadThumbnail(@UploadedFile() file: express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    return {
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/learning-thumbnails/${file.filename}`,
      size: file.size,
    };
  }

  /**
   * Get all content (admin endpoint with pagination)
   * GET /api/v1/learning/admin/all-content
   */
  @Get('admin/all-content')
  @UseGuards(JwtAuthGuard)
  async getAllContentAdmin(
    @Query('skip', new ParseIntPipe({ optional: true })) skip: number = 0,
    @Query('take', new ParseIntPipe({ optional: true })) take: number = 100,
  ) {
    const content = await this.learningService.getAllContent({
      skip,
      take,
    });
    return { data: content };
  }

  /**
   * Set content as featured/unfeatured
   * PATCH /api/v1/learning/content/:id/featured
   */
  @Patch('content/:id/featured')
  @UseGuards(JwtAuthGuard)
  async setFeatured(@Param('id') id: string, @Body() body: { featured: boolean }) {
    return this.learningService.setFeatured(id, body.featured);
  }

  /**
   * Add content to bookmarks
   * POST /api/v1/learning/bookmarks
   */
  @Post('bookmarks')
  @UseGuards(JwtAuthGuard)
  async addBookmark(@Body() createBookmarkDto: CreateBookmarkDto, @Request() req: any) {
    return this.learningService.addBookmark(createBookmarkDto, req.user.id);
  }

  /**
   * Remove bookmark
   * DELETE /api/v1/learning/bookmarks/:contentId
   */
  @Delete('bookmarks/:contentId')
  @UseGuards(JwtAuthGuard)
  async removeBookmark(@Param('contentId') contentId: string, @Request() req: any) {
    return this.learningService.removeBookmark(contentId, req.user.id);
  }

  /**
   * Get user's bookmarks
   * GET /api/v1/learning/bookmarks
   */
  @Get('bookmarks')
  @UseGuards(JwtAuthGuard)
  async getBookmarks(@Request() req: any, @Query('companyId') companyId?: string) {
    return this.learningService.getBookmarks(req.user.id, companyId);
  }

  /**
   * Check if content is bookmarked
   * GET /api/v1/learning/bookmarks/:contentId/is-bookmarked
   */
  @Get('bookmarks/:contentId/is-bookmarked')
  @UseGuards(JwtAuthGuard)
  async isBookmarked(@Param('contentId') contentId: string, @Request() req: any) {
    const bookmarked = await this.learningService.isBookmarked(contentId, req.user.id);
    return { contentId, isBookmarked: bookmarked };
  }

  /**
   * Submit feedback for content
   * POST /api/v1/learning/feedback
   */
  @Post('feedback')
  @UseGuards(JwtAuthGuard)
  async addFeedback(@Body() createFeedbackDto: CreateFeedbackDto, @Request() req: any) {
    return this.learningService.addFeedback(createFeedbackDto, req.user.id);
  }

  /**
   * Get feedback stats for content
   * GET /api/v1/learning/feedback/:contentId/stats
   */
  @Get('feedback/:contentId/stats')
  async getFeedbackStats(@Param('contentId') contentId: string) {
    return this.learningService.getFeedback(contentId);
  }

  /**
   * Get user's feedback for content
   * GET /api/v1/learning/feedback/:contentId
   */
  @Get('feedback/:contentId')
  @UseGuards(JwtAuthGuard)
  async getUserFeedback(@Param('contentId') contentId: string, @Request() req: any) {
    const feedback = await this.learningService.getUserFeedback(contentId, req.user.id);
    return feedback || { message: 'No feedback yet' };
  }

  /**
   * Get learning statistics
   * GET /api/v1/learning/admin/stats
   */
  @Get('admin/stats')
  @UseGuards(JwtAuthGuard)
  async getStats() {
    return this.learningService.getStats();
  }
}
