import { MigrationInterface, QueryRunner } from 'typeorm';

export class ToolBlogSeoExtend1779250000000 implements MigrationInterface {
  name = 'ToolBlogSeoExtend1779250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "featured_image_alt" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "og_image_alt" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "twitter_card" character varying(32) NOT NULL DEFAULT 'summary_large_image'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "author_name" character varying(120)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "article_section" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "schema_type" character varying(32) NOT NULL DEFAULT 'BlogPosting'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "seo_locale" character varying(12) NOT NULL DEFAULT 'en'`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "reading_time_minutes" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" ADD COLUMN IF NOT EXISTS "auto_generate_schema" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "auto_generate_schema"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "reading_time_minutes"`,
    );
    await queryRunner.query(`ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "seo_locale"`);
    await queryRunner.query(`ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "schema_type"`);
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "article_section"`,
    );
    await queryRunner.query(`ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "author_name"`);
    await queryRunner.query(`ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "twitter_card"`);
    await queryRunner.query(`ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "og_image_alt"`);
    await queryRunner.query(
      `ALTER TABLE "tool_blog_posts" DROP COLUMN IF EXISTS "featured_image_alt"`,
    );
  }
}
