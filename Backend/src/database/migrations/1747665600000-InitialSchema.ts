import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1747665600000 implements MigrationInterface {
  name = 'InitialSchema1747665600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying(255) NOT NULL,
        "password_hash" character varying(255) NOT NULL,
        "name" character varying(120),
        "role" character varying(20) NOT NULL DEFAULT 'user',
        "is_active" boolean NOT NULL DEFAULT true,
        "email_verified_at" TIMESTAMP WITH TIME ZONE,
        "last_login_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);

    await queryRunner.query(`
      CREATE TABLE "tools" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "slug" character varying(120) NOT NULL,
        "name" character varying(200) NOT NULL,
        "tagline" character varying(300) NOT NULL,
        "description" text NOT NULL,
        "category" character varying(50) NOT NULL,
        "icon" character varying(80) NOT NULL,
        "accent" character varying(20) NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'soon',
        "keywords" jsonb NOT NULL DEFAULT '[]',
        "featured" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tools" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_tools_slug" ON "tools" ("slug")`);
    await queryRunner.query(`CREATE INDEX "IDX_tools_category" ON "tools" ("category")`);

    await queryRunner.query(`
      CREATE TABLE "tool_favorites" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "tool_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tool_favorites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tool_favorites_user_tool" UNIQUE ("user_id", "tool_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_tool_favorites_user_id" ON "tool_favorites" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tool_favorites_tool_id" ON "tool_favorites" ("tool_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "admin_audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "action" character varying(80) NOT NULL,
        "entity_type" character varying(80) NOT NULL,
        "entity_id" character varying(120),
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_audit_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_audit_logs_user_id" ON "admin_audit_logs" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_admin_audit_logs_action" ON "admin_audit_logs" ("action")`,
    );

    await queryRunner.query(`
      CREATE TABLE "site_settings" (
        "key" character varying(100) NOT NULL,
        "value" jsonb NOT NULL,
        "updated_by_user_id" uuid,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_site_settings" PRIMARY KEY ("key")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "tool_favorites"
      ADD CONSTRAINT "FK_tool_favorites_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "tool_favorites"
      ADD CONSTRAINT "FK_tool_favorites_tool"
      FOREIGN KEY ("tool_id") REFERENCES "tools"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "admin_audit_logs"
      ADD CONSTRAINT "FK_admin_audit_logs_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "site_settings"
      ADD CONSTRAINT "FK_site_settings_user"
      FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "site_settings" DROP CONSTRAINT "FK_site_settings_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "FK_admin_audit_logs_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_favorites" DROP CONSTRAINT "FK_tool_favorites_tool"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tool_favorites" DROP CONSTRAINT "FK_tool_favorites_user"`,
    );
    await queryRunner.query(`DROP TABLE "site_settings"`);
    await queryRunner.query(`DROP TABLE "admin_audit_logs"`);
    await queryRunner.query(`DROP TABLE "tool_favorites"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tools_category"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tools_slug"`);
    await queryRunner.query(`DROP TABLE "tools"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_role"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
