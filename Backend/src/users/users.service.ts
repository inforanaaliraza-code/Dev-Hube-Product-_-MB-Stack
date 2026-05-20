import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ADMIN_ROLES, UserRole } from './user-role.enum';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  listAdmins() {
    return this.usersRepo.find({
      where: { role: In(ADMIN_ROLES) },
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'name', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
    });
  }

  listPublicUsers() {
    return this.usersRepo.find({
      where: { role: UserRole.USER },
      order: { createdAt: 'DESC' },
      select: ['id', 'email', 'name', 'isActive', 'lastLoginAt', 'createdAt'],
    });
  }
}
