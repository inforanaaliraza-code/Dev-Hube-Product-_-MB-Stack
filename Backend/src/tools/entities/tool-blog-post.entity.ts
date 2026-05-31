import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tool_blog_posts')
export class ToolBlogPostEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'tool_slug', type: 'varchar', length: 120 })
  toolSlug!: string;

  @Column({ type: 'varchar', length: 300 })
  title!: string;

  @Column({ type: 'text', default: '' })
  excerpt!: string;

  @Column({ type: 'text', default: '' })
  body!: string;

  @Column({ type: 'varchar', length: 12, default: 'draft' })
  status!: string;

  @Column({ name: 'featured_image_id', type: 'uuid', nullable: true })
  featuredImageId!: string | null;

  @Column({ name: 'featured_image_alt', type: 'varchar', length: 255, nullable: true })
  featuredImageAlt!: string | null;

  @Column({ name: 'meta_title', type: 'varchar', length: 300, nullable: true })
  metaTitle!: string | null;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription!: string | null;

  @Column({ name: 'focus_keyword', type: 'varchar', length: 200, nullable: true })
  focusKeyword!: string | null;

  @Column({ name: 'meta_keywords', type: 'jsonb', default: [] })
  metaKeywords!: string[];

  @Column({ name: 'canonical_url', type: 'varchar', length: 500, nullable: true })
  canonicalUrl!: string | null;

  @Column({ name: 'og_title', type: 'varchar', length: 300, nullable: true })
  ogTitle!: string | null;

  @Column({ name: 'og_description', type: 'text', nullable: true })
  ogDescription!: string | null;

  @Column({ name: 'og_image_id', type: 'uuid', nullable: true })
  ogImageId!: string | null;

  @Column({ name: 'og_image_alt', type: 'varchar', length: 255, nullable: true })
  ogImageAlt!: string | null;

  @Column({ name: 'twitter_title', type: 'varchar', length: 300, nullable: true })
  twitterTitle!: string | null;

  @Column({ name: 'twitter_description', type: 'text', nullable: true })
  twitterDescription!: string | null;

  @Column({ name: 'twitter_card', type: 'varchar', length: 32, default: 'summary_large_image' })
  twitterCard!: string;

  @Column({ name: 'author_name', type: 'varchar', length: 120, nullable: true })
  authorName!: string | null;

  @Column({ name: 'article_section', type: 'varchar', length: 100, nullable: true })
  articleSection!: string | null;

  @Column({ name: 'schema_type', type: 'varchar', length: 32, default: 'BlogPosting' })
  schemaType!: string;

  @Column({ name: 'seo_locale', type: 'varchar', length: 12, default: 'en' })
  seoLocale!: string;

  @Column({ name: 'reading_time_minutes', type: 'int', nullable: true })
  readingTimeMinutes!: number | null;

  @Column({ name: 'auto_generate_schema', type: 'boolean', default: true })
  autoGenerateSchema!: boolean;

  @Column({ type: 'varchar', length: 50, default: 'index,follow' })
  robots!: string;

  @Column({ type: 'boolean', default: false })
  noindex!: boolean;

  @Column({ type: 'boolean', default: false })
  nofollow!: boolean;

  @Column({ name: 'schema_json', type: 'text', nullable: true })
  schemaJson!: string | null;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
