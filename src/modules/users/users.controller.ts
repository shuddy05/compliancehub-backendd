import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RequiredRoles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@GetUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Get()
  @UseGuards(RolesGuard)
  @RequiredRoles('admin', 'manager', 'super_admin')
  async getAllUsers(@Query('limit') limit = '10', @Query('offset') offset = '0') {
    return this.usersService.findAll(limit, offset);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
    @GetUser() user: JwtPayload,
  ) {
    return this.usersService.update(id, updateUserDto, user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequiredRoles('company_admin', 'super_admin')
  async deleteUser(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  @Get('admin/all')
  @UseGuards(RolesGuard)
  @RequiredRoles('super_admin')
  async getAllUsersForAdmin(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.usersService.findAllForAdmin(skip, take);
  }

  @Get('admin/support-staff')
  @UseGuards(RolesGuard)
  @RequiredRoles('super_admin')
  async getSupportStaff(
    @Query('skip') skip: number = 0,
    @Query('take') take: number = 10,
  ) {
    return this.usersService.findSupportStaff(skip, take);
  }
}
