import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['companyUsers', 'companyUsers.company'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
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
