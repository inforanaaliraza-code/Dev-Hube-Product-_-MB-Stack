import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { seedAdmin } from '../database/seeds/admin.seed';
import { UserEntity } from '../users/entities/user.entity';
import { ADMIN_ROLES, UserRole } from '../users/user-role.enum';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seedSuperAdmin();
  }

  async seedSuperAdmin() {
    const email = this.config.get<string>('auth.seedAdminEmail') ?? 'admin@devhube.com';
    const password = this.config.get<string>('auth.seedAdminPassword') ?? 'changeme';
    await seedAdmin(this.usersRepo, email, password);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = bcrypt.compareSync(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    return this.buildAuthResponse(user);
  }

  async loginAdmin(dto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.login(dto);
    if (!ADMIN_ROLES.includes(result.user.role)) {
      throw new UnauthorizedException('Admin access required');
    }
    return result;
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.usersRepo.findOne({ where: { email } });
    if (exists) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepo.create({
      email,
      passwordHash: await bcrypt.hash(dto.password, 12),
      name: dto.name?.trim() ?? null,
      role: UserRole.USER,
      isActive: true,
    });
    await this.usersRepo.save(user);
    return this.buildAuthResponse(user);
  }

  async getProfile(userId: string): Promise<AuthUserDto> {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found');
    }
    return AuthUserDto.fromEntity(user);
  }

  private buildAuthResponse(user: UserEntity): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const response = new AuthResponseDto();
    response.accessToken = this.jwtService.sign(payload);
    response.user = AuthUserDto.fromEntity(user);
    return response;
  }
}
