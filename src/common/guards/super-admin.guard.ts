import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) return false;

    const u = await this.userRepo.findOne({ where: { id: user.sub }, relations: ['companyUsers'] });
    if (!u) return false;

    return (u.companyUsers || []).some((cu) => cu.role === 'super_admin');
  }
}
