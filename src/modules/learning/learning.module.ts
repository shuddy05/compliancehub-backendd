import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningContent } from '../../database/entities/learning-content.entity';
import { LearningBookmark } from '../../database/entities/learning-bookmark.entity';
import { LearningFeedback } from '../../database/entities/learning-feedback.entity';
import { LearningService } from './learning.service';
import { LearningController } from './learning.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LearningContent, LearningBookmark, LearningFeedback])],
  controllers: [LearningController],
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
