import { MigrationInterface, QueryRunner } from 'typeorm';

export class CmsSchema1779220000000 implements MigrationInterface {
  name = 'CmsSchema1779220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "media_assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "filename" character varying(255) NOT NULL,
        "original_name" character varying(255) NOT NULL,
        "mime_type" character varying(120) NOT NULL,
        "size_bytes" integer NOT NULL,
        "url_path" character varying(500) NOT NULL,
        "alt" character varying(255),
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media_assets" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "cms_contents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying(200) NOT NULL,
        "title" character varying(300) NOT NULL,
        "excerpt" text NOT NULL DEFAULT '',
        "body" text NOT NULL DEFAULT '',
        "type" character varying(10) NOT NULL,
        "status" character varying(12) NOT NULL DEFAULT 'draft',
        "featured_image_id" uuid,
        "published_at" TIMESTAMP WITH TIME ZONE,
        "author_id" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cms_contents" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cms_contents_slug" ON "cms_contents" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cms_contents_type" ON "cms_contents" ("type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_cms_contents_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cms_contents_slug"`);
    await queryRunner.query(`DROP TABLE "cms_contents"`);
    await queryRunner.query(`DROP TABLE "media_assets"`);
  }
}
