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
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePayrollRunDto } from './dto/create-payroll-run.dto';

@Controller('companies/:companyId/payroll')
@UseGuards(JwtAuthGuard)
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  /**
   * Create a new payroll run
   * POST /api/v1/companies/:companyId/payroll/runs
   */
  @Post('runs')
  async createPayrollRun(
    @Param('companyId') companyId: string,
    @Body() createPayrollRunDto: CreatePayrollRunDto,
    @Request() req,
  ) {
    return this.payrollService.createPayrollRun(
      companyId,
      createPayrollRunDto,
      req.user.id,
    );
  }

  /**
   * Get all payroll runs for a company
   * GET /api/v1/companies/:companyId/payroll/runs
   */
  @Get('runs')
  async getPayrollRuns(
    @Param('companyId') companyId: string,
    @Request() req,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.payrollService.getPayrollRuns(companyId, req.user.id, skip, take);
  }

  /**
   * Get a specific payroll run
   * GET /api/v1/companies/:companyId/payroll/runs/:id
   */
  @Get('runs/:id')
  async getPayrollRun(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.payrollService.getPayrollRun(companyId, id, req.user.id);
  }

  /**
   * Get payroll run items (individual employee payrolls)
   * GET /api/v1/companies/:companyId/payroll/runs/:id/items
   */
  @Get('runs/:id/items')
  async getPayrollRunItems(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.payrollService.getPayrollRunItems(companyId, id, req.user.id);
  }

  /**
   * Approve a payroll run
   * PUT /api/v1/companies/:companyId/payroll/runs/:id/approve
   */
  @Put('runs/:id/approve')
  async approvePayrollRun(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.payrollService.approvePayrollRun(companyId, id, req.user.id);
  }

  /**
   * Reject a payroll run
   * PUT /api/v1/companies/:companyId/payroll/runs/:id/reject
   */
  @Put('runs/:id/reject')
  async rejectPayrollRun(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.payrollService.rejectPayrollRun(companyId, id, req.user.id);
  }

  /**
   * Delete a payroll run
   * DELETE /api/v1/companies/:companyId/payroll/runs/:id
   */
  @Delete('runs/:id')
  async deletePayrollRun(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.payrollService.deletePayrollRun(companyId, id, req.user.id);
  }

  /**
   * Get payroll summary for company
   * GET /api/v1/companies/:companyId/payroll/summary
   */
  @Get('summary')
  async getPayrollSummary(
    @Param('companyId') companyId: string,
    @Request() req,
    @Query('year') year?: number,
    @Query('month') month?: number,
  ) {
    return this.payrollService.getPayrollSummary(companyId, req.user.id, year, month);
  }
}
