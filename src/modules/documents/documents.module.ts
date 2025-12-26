import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from '../../database/entities/document.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Document, CompanyUser])],
  controllers: [DocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
