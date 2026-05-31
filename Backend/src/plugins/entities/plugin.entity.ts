import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum PluginType {
  INTEGRATION = 'integration',
  WORKER = 'worker',
  EXTENSION = 'extension',
}

export enum PluginStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('plugins')
export class PluginEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  slug!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'varchar', length: 32, default: '1.0.0' })
  version!: string;

  @Index()
  @Column({ type: 'varchar', length: 20, default: PluginType.EXTENSION })
  type!: PluginType;

  @Column({ type: 'varchar', length: 12, default: PluginStatus.INACTIVE })
  status!: PluginStatus;

  @Column({ type: 'varchar', length: 50, default: 'general' })
  category!: string;

  @Column({ name: 'admin_path', type: 'varchar', length: 200, nullable: true })
  adminPath!: string | null;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  isSystem!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
