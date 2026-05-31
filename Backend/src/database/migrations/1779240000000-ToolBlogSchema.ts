import { MigrationInterface, QueryRunner } from 'typeorm';

export class ToolBlogSchema1779240000000 implements MigrationInterface {
  name = 'ToolBlogSchema1779240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tool_blog_posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tool_slug" character varying(120) NOT NULL,
        "title" character varying(300) NOT NULL,
        "excerpt" text NOT NULL DEFAULT '',
        "body" text NOT NULL DEFAULT '',
        "status" character varying(12) NOT NULL DEFAULT 'draft',
        "featured_image_id" uuid,
        "meta_title" character varying(300),
        "meta_description" text,
        "focus_keyword" character varying(200),
        "meta_keywords" jsonb NOT NULL DEFAULT '[]',
        "canonical_url" character varying(500),
        "og_title" character varying(300),
        "og_description" text,
        "og_image_id" uuid,
        "twitter_title" character varying(300),
        "twitter_description" text,
        "robots" character varying(50) NOT NULL DEFAULT 'index,follow',
        "noindex" boolean NOT NULL DEFAULT false,
        "nofollow" boolean NOT NULL DEFAULT false,
        "schema_json" text,
        "published_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tool_blog_posts" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_tool_blog_posts_tool_slug" ON "tool_blog_posts" ("tool_slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_tool_blog_posts_tool_slug"`);
    await queryRunner.query(`DROP TABLE "tool_blog_posts"`);
  }
}
