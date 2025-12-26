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
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('companies/:companyId/employees')
@UseGuards(JwtAuthGuard)
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  /**
   * Create a new employee
   * POST /api/v1/companies/:companyId/employees
   */
  @Post()
  async create(
    @Param('companyId') companyId: string,
    @Body() createEmployeeDto: CreateEmployeeDto,
    @Request() req,
  ) {
    return this.employeesService.create(companyId, createEmployeeDto, req.user.id);
  }

  /**
   * Get all employees in a company
   * GET /api/v1/companies/:companyId/employees
   */
  @Get()
  async findAll(
    @Param('companyId') companyId: string,
    @Request() req,
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.employeesService.findAll(companyId, req.user.id, skip, take);
  }

  /**
   * Get a specific employee
   * GET /api/v1/companies/:companyId/employees/:id
   */
  @Get(':id')
  async findOne(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.employeesService.findOne(companyId, id, req.user.id);
  }

  /**
   * Update an employee
   * PUT /api/v1/companies/:companyId/employees/:id
   */
  @Put(':id')
  async update(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Request() req,
  ) {
    return this.employeesService.update(companyId, id, updateEmployeeDto, req.user.id);
  }

  /**
   * Delete an employee (soft delete)
   * DELETE /api/v1/companies/:companyId/employees/:id
   */
  @Delete(':id')
  async remove(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.employeesService.remove(companyId, id, req.user.id);
  }

  /**
   * Get employee tax relief information
   * GET /api/v1/companies/:companyId/employees/:id/tax-relief
   */
  @Get(':id/tax-relief')
  async getTaxRelief(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
  ) {
    return this.employeesService.getTaxRelief(companyId, id, req.user.id);
  }

  /**
   * Get employee payroll history
   * GET /api/v1/companies/:companyId/employees/:id/payroll-history
   */
  @Get(':id/payroll-history')
  async getPayrollHistory(
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Request() req,
    @Query('limit') limit: number = 12,
  ) {
    return this.employeesService.getPayrollHistory(companyId, id, req.user.id, limit);
  }
}
