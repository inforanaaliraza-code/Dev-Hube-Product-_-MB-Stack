import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AdminAuditLogEntity } from '../../audit/entities/admin-audit-log.entity';
import { ToolFavoriteEntity } from '../../favorites/entities/tool-favorite.entity';
import { UserRole } from '../user-role.enum';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255 })
  email!: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  name!: string | null;

  @Index()
  @Column({ type: 'varchar', length: 20, default: UserRole.USER })
  role!: UserRole;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date | null;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ToolFavoriteEntity, (f) => f.user)
  favorites!: ToolFavoriteEntity[];

  @OneToMany(() => AdminAuditLogEntity, (log) => log.user)
  auditLogs!: AdminAuditLogEntity[];
}
