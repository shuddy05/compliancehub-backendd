import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../../database/entities/document.entity';
import { CompanyUser } from '../../database/entities/company-user.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(CompanyUser)
    private companyUserRepository: Repository<CompanyUser>,
  ) {}

  /**
   * Upload a document
   */
  async uploadDocument(
    companyId: string,
    file: any,
    uploadDto: {
      documentType: string;
      documentName: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
    },
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    // TODO: Upload file to cloud storage (S3, GCS, etc)
    // For now, just store the metadata

    const document = new Document();
    document.documentType = uploadDto.documentType;
    document.documentName = uploadDto.documentName;
    document.fileUrl = '/path/to/file';
    document.fileSize = file.size;
    document.fileType = file.mimetype;
    if (uploadDto.relatedEntityType) {
      document.relatedEntityType = uploadDto.relatedEntityType;
    }
    if (uploadDto.relatedEntityId) {
      document.relatedEntityId = uploadDto.relatedEntityId;
    }
    document.companyId = companyId;
    document.uploadedById = userId;

    const saved = await this.documentRepository.save(document);

    return {
      id: saved.id,
      documentName: saved.documentName,
      documentType: saved.documentType,
      fileSize: saved.fileSize,
      uploadedAt: saved.uploadedAt,
    };
  }

  /**
   * Get all documents for a company
   */
  async getDocuments(
    companyId: string,
    userId: string,
    skip: number = 0,
    take: number = 10,
    documentType?: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const query = this.documentRepository.createQueryBuilder('d');
    query.where('d.companyId = :companyId', { companyId });

    if (documentType) {
      query.andWhere('d.documentType = :documentType', { documentType });
    }

    const documents = await query
      .orderBy('d.createdAt', 'DESC')
      .skip(skip)
      .take(take)
      .getMany();

    const total = await query.getCount();

    return {
      data: documents.map((d) => ({
        id: d.id,
        documentName: d.documentName,
        documentType: d.documentType,
        fileSize: d.fileSize,
        fileType: d.fileType,
        uploadedAt: d.uploadedAt,
      })),
      total,
      skip,
      take,
    };
  }

  /**
   * Get a specific document
   */
  async getDocument(companyId: string, documentId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const document = await this.documentRepository.findOne({
      where: { id: documentId, company: { id: companyId } },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return {
      id: document.id,
      documentName: document.documentName,
      documentType: document.documentType,
      fileUrl: document.fileUrl,
      fileSize: document.fileSize,
      fileType: document.fileType,
      relatedEntityType: document.relatedEntityType,
      relatedEntityId: document.relatedEntityId,
      uploadedAt: document.uploadedAt,
    };
  }

  /**
   * Download a document
   */
  async downloadDocument(companyId: string, documentId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const document = await this.documentRepository.findOne({
      where: { id: documentId, company: { id: companyId } },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // TODO: Return file download stream from cloud storage
    return {
      message: 'Download initiated',
      fileUrl: document.fileUrl,
    };
  }

  /**
   * Delete a document
   */
  async deleteDocument(companyId: string, documentId: string, userId: string) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const document = await this.documentRepository.findOne({
      where: { id: documentId, company: { id: companyId } },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // TODO: Delete file from cloud storage

    await this.documentRepository.remove(document);

    return { message: 'Document deleted' };
  }

  /**
   * Get documents by entity
   */
  async getDocumentsByEntity(
    companyId: string,
    entityType: string,
    entityId: string,
    userId: string,
  ) {
    const hasAccess = await this.companyUserRepository.findOne({
      where: { company: { id: companyId }, user: { id: userId } },
    });

    if (!hasAccess) {
      throw new ForbiddenException('Access denied');
    }

    const documents = await this.documentRepository.find({
      where: {
        company: { id: companyId },
        relatedEntityType: entityType,
        relatedEntityId: entityId,
      },
    });

    return {
      entityType,
      entityId,
      documents: documents.map((d) => ({
        id: d.id,
        documentName: d.documentName,
        documentType: d.documentType,
        fileType: d.fileType,
        fileSize: d.fileSize,
      })),
    };
  }
}
