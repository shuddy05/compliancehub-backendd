import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('companies/:companyId/documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private documentsService: DocumentsService) {}

  /**
   * Upload a document
   * POST /api/v1/companies/:companyId/documents
   */
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('companyId') companyId: string,
    @UploadedFile() file: any,
    @Body() uploadDto: { documentType: string; documentName: string; relatedEntityType?: string; relatedEntityId?: string },
    @Request() req,
  ) {
    return this.documentsService.uploadDocument(
      companyId,
      file,
      uploadDto,
      req.user.id,
    );
  }

  /**
   * Get all documents for a company
   * GET /api/v1/companies/:companyId/documents
   */
  @Get()
  async getDocuments(
    @Param('companyId') companyId: string,
    @Request() req,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @Query('documentType') documentType?: string,
  ) {
    return this.documentsService.getDocuments(
      companyId,
      req.user.id,
      skip,
      take,
      documentType,
    );
  }

  /**
   * Get a specific document
   * GET /api/v1/companies/:companyId/documents/:id
   */
  @Get(':id')
  async getDocument(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.documentsService.getDocument(companyId, id, req.user.id);
  }

  /**
   * Download a document
   * GET /api/v1/companies/:companyId/documents/:id/download
   */
  @Get(':id/download')
  async downloadDocument(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.documentsService.downloadDocument(companyId, id, req.user.id);
  }

  /**
   * Delete a document
   * DELETE /api/v1/companies/:companyId/documents/:id
   */
  @Delete(':id')
  async deleteDocument(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.documentsService.deleteDocument(companyId, id, req.user.id);
  }

  /**
   * Get documents by entity (e.g., compliance filing documents)
   * GET /api/v1/companies/:companyId/documents/entity/:entityType/:entityId
   */
  @Get('entity/:entityType/:entityId')
  async getDocumentsByEntity(
    @Param('companyId') companyId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Request() req,
  ) {
    return this.documentsService.getDocumentsByEntity(
      companyId,
      entityType,
      entityId,
      req.user.id,
    );
  }
}
