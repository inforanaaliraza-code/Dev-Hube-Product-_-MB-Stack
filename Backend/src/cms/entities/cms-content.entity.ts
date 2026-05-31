import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CmsContentType {
  PAGE = 'page',
  POST = 'post',
}

export enum CmsContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('cms_contents')
export class CmsContentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 200 })
  slug!: string;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ type: 'text', default: '' })
  excerpt!: string;

  @Column({ type: 'text', default: '' })
  body!: string;

  @Index()
  @Column({ type: 'varchar', length: 10 })
  type!: CmsContentType;

  @Column({ type: 'varchar', length: 12, default: CmsContentStatus.DRAFT })
  status!: CmsContentStatus;

  @Column({ name: 'featured_image_id', type: 'uuid', nullable: true })
  featuredImageId!: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @Column({ name: 'author_id', type: 'uuid', nullable: true })
  authorId!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
