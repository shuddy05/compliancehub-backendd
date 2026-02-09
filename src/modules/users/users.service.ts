import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto, UpdateUserDto, UserResponseDto, CompanyUserResponseDto, CompanyResponseDto } from './dto/user.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private toUserResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      preferredLanguage: user.preferredLanguage,
      darkModeEnabled: user.darkModeEnabled,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      companyUsers: (user.companyUsers || []).map(cu => ({
        id: cu.id,
        companyId: cu.companyId,
        role: cu.role,
        isPrimaryCompany: cu.isPrimaryCompany,
        isActive: cu.isActive,
        company: {
          id: cu.company.id,
          name: cu.company.name,
          industry: cu.company.industry,
          employeeCount: cu.company.employeeCount,
          subscriptionTier: cu.company.subscriptionTier,
          subscriptionStatus: cu.company.subscriptionStatus,
        } as CompanyResponseDto,
      } as CompanyUserResponseDto)),
    };
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        companyUsers: {
          company: true,
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Ensure companyUsers is always an array
    if (!user.companyUsers) {
      user.companyUsers = [];
    }

    return this.toUserResponseDto(user);
  }

  async findAll(limit: string | number, offset: string | number) {
    const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    const offsetNum = typeof offset === 'string' ? parseInt(offset, 10) : offset;
    const [users, total] = await this.userRepository.findAndCount({
      take: limitNum,
      skip: offsetNum,
      relations: ['companyUsers', 'companyUsers.company'],
    });

    return {
      data: users,
      total,
      limit,
      offset,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser: JwtPayload,
  ) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Users can only update their own profile unless they're admin
    if (id !== currentUser.sub && !currentUser.roles.includes('admin')) {
      throw new BadRequestException(
        'You can only update your own profile',
      );
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async delete(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    user.isActive = false;
    return this.userRepository.save(user);
  }

  async findAllForAdmin(skip: number = 0, take: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['companyUsers', 'companyUsers.company'],
    });

    // Count users created in the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newThisWeek = await this.userRepository.countBy({
      createdAt: MoreThan(weekAgo),
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        isActive: user.isActive,
      })),
      total,
      newThisWeek,
      skip,
      take,
    };
  }

  async findSupportStaff(skip: number = 0, take: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
      relations: ['companyUsers', 'companyUsers.company'],
      where: {
        companyUsers: {
          role: 'support_staff',
        },
      },
    });

    return {
      data: users.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        isActive: user.isActive,
        role: 'support_staff',
      })),
      total,
      skip,
      take,
    };
  }
}
