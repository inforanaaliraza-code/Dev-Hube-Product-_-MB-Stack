import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ToolEntity } from '../../tools/entities/tool.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('tool_favorites')
@Unique(['userId', 'toolId'])
export class ToolFavoriteEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Index()
  @Column({ name: 'tool_id', type: 'uuid' })
  toolId!: string;

  @ManyToOne(() => ToolEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tool_id' })
  tool!: ToolEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
