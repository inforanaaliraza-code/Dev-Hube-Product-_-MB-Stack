import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('temp_mailboxes')
export class TempMailboxEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 320 })
  address!: string;

  @Column({ type: 'varchar', length: 40, default: 'mail.tm' })
  provider!: string;

  @Column({ name: 'provider_account_id', type: 'varchar', length: 120 })
  providerAccountId!: string;

  @Column({ name: 'provider_password', type: 'varchar', length: 120 })
  providerPassword!: string;

  @Column({ name: 'bearer_token', type: 'text', nullable: true })
  bearerToken!: string | null;

  @Column({ name: 'token_expires_at', type: 'timestamptz', nullable: true })
  tokenExpiresAt!: Date | null;

  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;
}
