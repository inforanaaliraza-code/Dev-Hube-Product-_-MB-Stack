import { MigrationInterface, QueryRunner } from 'typeorm';

export class PluginsSchema1779230000000 implements MigrationInterface {
  name = 'PluginsSchema1779230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "plugins" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying(120) NOT NULL,
        "name" character varying(200) NOT NULL,
        "description" text NOT NULL DEFAULT '',
        "version" character varying(32) NOT NULL DEFAULT '1.0.0',
        "type" character varying(20) NOT NULL DEFAULT 'extension',
        "status" character varying(12) NOT NULL DEFAULT 'inactive',
        "category" character varying(50) NOT NULL DEFAULT 'general',
        "admin_path" character varying(200),
        "is_system" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_plugins" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_plugins_slug" ON "plugins" ("slug")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_plugins_type" ON "plugins" ("type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_plugins_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_plugins_slug"`);
    await queryRunner.query(`DROP TABLE "plugins"`);
  }
}
