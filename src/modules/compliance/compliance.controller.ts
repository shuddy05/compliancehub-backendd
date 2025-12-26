import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateComplianceFilingDto } from './dto/create-compliance-filing.dto';

@Controller('companies/:companyId/compliance')
@UseGuards(JwtAuthGuard)
export class ComplianceController {
  constructor(private complianceService: ComplianceService) {}

  /**
   * Get all compliance obligations for a company
   * GET /api/v1/companies/:companyId/compliance/obligations
   */
  @Get('obligations')
  async getObligations(
    @Param('companyId') companyId: string,
    @Request() req,
  ) {
    return this.complianceService.getObligations(companyId, req.user.id);
  }

  /**
   * Get compliance filings for a company
   * GET /api/v1/companies/:companyId/compliance/filings
   */
  @Get('filings')
  async getFilings(
    @Param('companyId') companyId: string,
    @Request() req,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
    @Query('status') status?: string,
  ) {
    return this.complianceService.getFilings(companyId, req.user.id, skip, take, status);
  }

  /**
   * Get a specific compliance filing
   * GET /api/v1/companies/:companyId/compliance/filings/:id
   */
  @Get('filings/:id')
  async getFiling(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.complianceService.getFiling(companyId, id, req.user.id);
  }

  /**
   * Create a compliance filing
   * POST /api/v1/companies/:companyId/compliance/filings
   */
  @Post('filings')
  async createFiling(
    @Param('companyId') companyId: string,
    @Body() createFilingDto: CreateComplianceFilingDto,
    @Request() req,
  ) {
    return this.complianceService.createFiling(companyId, createFilingDto, req.user.id);
  }

  /**
   * Update a compliance filing
   * PUT /api/v1/companies/:companyId/compliance/filings/:id
   */
  @Put('filings/:id')
  async updateFiling(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() updateDto: any,
    @Request() req,
  ) {
    return this.complianceService.updateFiling(companyId, id, updateDto, req.user.id);
  }

  /**
   * Mark filing as filed/submitted
   * PUT /api/v1/companies/:companyId/compliance/filings/:id/submit
   */
  @Put('filings/:id/submit')
  async submitFiling(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() submitDto: { filingReference?: string; filingMethod: string },
    @Request() req,
  ) {
    return this.complianceService.submitFiling(companyId, id, submitDto, req.user.id);
  }

  /**
   * Mark filing as paid
   * PUT /api/v1/companies/:companyId/compliance/filings/:id/mark-paid
   */
  @Put('filings/:id/mark-paid')
  async markPaid(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() paymentDto: { paidAmount: number; paymentReference: string },
    @Request() req,
  ) {
    return this.complianceService.markPaid(companyId, id, paymentDto, req.user.id);
  }

  /**
   * Delete a filing (draft only)
   * DELETE /api/v1/companies/:companyId/compliance/filings/:id
   */
  @Delete('filings/:id')
  async deleteFiling(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.complianceService.deleteFiling(companyId, id, req.user.id);
  }

  /**
   * Get compliance calendar (upcoming deadlines)
   * GET /api/v1/companies/:companyId/compliance/calendar
   */
  @Get('calendar')
  async getComplianceCalendar(
    @Param('companyId') companyId: string,
    @Request() req,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.complianceService.getComplianceCalendar(
      companyId,
      req.user.id,
      year,
      month,
    );
  }

  /**
   * Get compliance summary/dashboard
   * GET /api/v1/companies/:companyId/compliance/summary
   */
  @Get('summary')
  async getComplianceSummary(
    @Param('companyId') companyId: string,
    @Request() req,
  ) {
    return this.complianceService.getComplianceSummary(companyId, req.user.id);
  }
}
