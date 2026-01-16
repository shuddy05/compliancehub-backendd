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
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RequiredRoles } from '../../common/decorators/roles.decorator';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  /**
   * Create a new company
   * POST /api/v1/companies
   */
  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto, @Request() req) {
    return this.companiesService.create(createCompanyDto, req.user.id);
  }

  /**
   * Get all companies for the current user
   * GET /api/v1/companies
   */
  @Get()
  async findAll(@Request() req, @Query('skip') skip: number = 0, @Query('take') take: number = 10) {
    return this.companiesService.findAllForUser(req.user.id, skip, take);
  }

  /**
   * Get all companies in the system (super_admin only)
   * GET /api/v1/companies/admin/all
   */
  @Get('admin/all')
  @UseGuards(RolesGuard)
  @RequiredRoles('super_admin')
  async getAllCompanies(@Query('skip') skip: number = 0, @Query('take') take: number = 10) {
    return this.companiesService.findAll(skip, take);
  }

  /**
   * Get a specific company by ID
   * GET /api/v1/companies/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.companiesService.findOne(id, req.user.id);
  }

  /**
   * Update a company
   * PUT /api/v1/companies/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Request() req,
  ) {
    return this.companiesService.update(id, updateCompanyDto, req.user.id);
  }

  /**
   * Delete a company (soft delete for data retention)
   * DELETE /api/v1/companies/:id
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.companiesService.remove(id, req.user.id);
  }

  /**
   * Get company settings
   * GET /api/v1/companies/:id/settings
   */
  @Get(':id/settings')
  async getSettings(@Param('id') id: string, @Request() req) {
    return this.companiesService.getSettings(id, req.user.id);
  }

  /**
   * Update company settings
   * PUT /api/v1/companies/:id/settings
   */
  @Put(':id/settings')
  async updateSettings(
    @Param('id') id: string,
    @Body() settingsDto: any,
    @Request() req,
  ) {
    return this.companiesService.updateSettings(id, settingsDto, req.user.id);
  }

  /**
   * Get company subscription info
   * GET /api/v1/companies/:id/subscription
   */
  @Get(':id/subscription')
  async getSubscription(@Param('id') id: string, @Request() req) {
    return this.companiesService.getSubscription(id, req.user.id);
  }

  /**
   * Get company users (team members)
   * GET /api/v1/companies/:id/users
   */
  @Get(':id/users')
  async getUsers(@Param('id') id: string, @Request() req) {
    return this.companiesService.getCompanyUsers(id, req.user.id);
  }

  /**
   * Invite a user to company
   * POST /api/v1/companies/:id/invite
   */
  @Post(':id/invite')
  async inviteUser(
    @Param('id') companyId: string,
    @Body() inviteDto: { email: string; role: string },
    @Request() req,
  ) {
    return this.companiesService.inviteUser(companyId, inviteDto, req.user.id);
  }

  /**
   * Remove user from company
   * DELETE /api/v1/companies/:id/users/:userId
   */
  @Delete(':id/users/:userId')
  async removeUser(
    @Param('id') companyId: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.companiesService.removeUser(companyId, userId, req.user.id);
  }

  /**
   * Get compliance dashboard summary
   * GET /api/v1/companies/:id/compliance-summary
   */
  @Get(':id/compliance-summary')
  async getComplianceSummary(@Param('id') id: string, @Request() req) {
    return this.companiesService.getComplianceSummary(id, req.user.id);
  }

  /**
   * Get payroll dashboard summary
   * GET /api/v1/companies/:id/payroll-summary
   */
  @Get(':id/payroll-summary')
  async getPayrollSummary(@Param('id') id: string, @Request() req) {
    return this.companiesService.getPayrollSummary(id, req.user.id);
  }
}
