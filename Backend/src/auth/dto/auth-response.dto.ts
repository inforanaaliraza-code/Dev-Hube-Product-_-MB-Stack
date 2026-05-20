import { UserEntity } from '../../users/entities/user.entity';
import { UserRole } from '../../users/user-role.enum';

export class AuthUserDto {
  id!: string;
  email!: string;
  name!: string | null;
  role!: UserRole;

  static fromEntity(user: UserEntity): AuthUserDto {
    const dto = new AuthUserDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    dto.role = user.role;
    return dto;
  }
}

export class AuthResponseDto {
  accessToken!: string;
  user!: AuthUserDto;
}
