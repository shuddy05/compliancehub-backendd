import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
      relations: ['companyUsers'],
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
      relations: ['companyUsers'],
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
}
