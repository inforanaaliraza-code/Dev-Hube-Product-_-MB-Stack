import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { UserRole } from '../../users/user-role.enum';

export async function seedAdmin(
  usersRepo: Repository<UserEntity>,
  email: string,
  password: string,
): Promise<UserEntity> {
  const normalized = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await usersRepo.findOne({ where: { email: normalized } });

  const syncFromEnv =
    process.env.ADMIN_RESET_PASSWORD === 'true' ||
    (process.env.NODE_ENV ?? 'development') !== 'production';

  if (existing) {
    if (syncFromEnv) {
      existing.passwordHash = passwordHash;
      existing.role = UserRole.SUPER_ADMIN;
      existing.isActive = true;
      existing.name = existing.name ?? 'Super Admin';
      if (!existing.emailVerifiedAt) {
        existing.emailVerifiedAt = new Date();
      }
      return usersRepo.save(existing);
    }
    return existing;
  }

  const user = usersRepo.create({
    email: normalized,
    passwordHash,
    name: 'Super Admin',
    role: UserRole.SUPER_ADMIN,
    isActive: true,
    emailVerifiedAt: new Date(),
  });

  return usersRepo.save(user);
}
