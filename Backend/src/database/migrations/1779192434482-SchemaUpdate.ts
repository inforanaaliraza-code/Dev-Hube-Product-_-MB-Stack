import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1779192434482 implements MigrationInterface {
    name = 'SchemaUpdate1779192434482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tools" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "slug" character varying(120) NOT NULL, "name" character varying(200) NOT NULL, "tagline" character varying(300) NOT NULL, "description" text NOT NULL, "category" character varying(50) NOT NULL, "icon" character varying(80) NOT NULL, "accent" character varying(20) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'soon', "keywords" jsonb NOT NULL DEFAULT '[]', "featured" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e23d56734caad471277bad8bf85" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c435f7a12371db979e76146f27" ON "tools" ("slug") `);
        await queryRunner.query(`CREATE INDEX "IDX_577a9ddfdb8ebe33e89280d176" ON "tools" ("category") `);
        await queryRunner.query(`CREATE TABLE "tool_favorites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "tool_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7d8a432e163beecd29815dedfe5" UNIQUE ("user_id", "tool_id"), CONSTRAINT "PK_293a13847d4c06b88b9051e9036" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_08687f88a37a213082bd0f90ea" ON "tool_favorites" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c4bdee605f6a53d5baffb23e4f" ON "tool_favorites" ("tool_id") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" character varying(255) NOT NULL, "name" character varying(120), "role" character varying(20) NOT NULL DEFAULT 'user', "is_active" boolean NOT NULL DEFAULT true, "email_verified_at" TIMESTAMP WITH TIME ZONE, "last_login_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `);
        await queryRunner.query(`CREATE TABLE "admin_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "action" character varying(80) NOT NULL, "entity_type" character varying(80) NOT NULL, "entity_id" character varying(120), "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_de7a8fc2fbb525484c71a86bb96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b8d67df2bc27d0af1b7caedcbc" ON "admin_audit_logs" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5d49c245604bbfa780a30ae97d" ON "admin_audit_logs" ("action") `);
        await queryRunner.query(`CREATE TABLE "site_settings" ("key" character varying(100) NOT NULL, "value" jsonb NOT NULL, "updated_by_user_id" uuid, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e71167433328a5afb90dda43da0" PRIMARY KEY ("key"))`);
        await queryRunner.query(`ALTER TABLE "tool_favorites" ADD CONSTRAINT "FK_08687f88a37a213082bd0f90ea0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tool_favorites" ADD CONSTRAINT "FK_c4bdee605f6a53d5baffb23e4f0" FOREIGN KEY ("tool_id") REFERENCES "tools"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "FK_b8d67df2bc27d0af1b7caedcbca" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "site_settings" ADD CONSTRAINT "FK_835dcf1f7801ff58d157b8632f3" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "site_settings" DROP CONSTRAINT "FK_835dcf1f7801ff58d157b8632f3"`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "FK_b8d67df2bc27d0af1b7caedcbca"`);
        await queryRunner.query(`ALTER TABLE "tool_favorites" DROP CONSTRAINT "FK_c4bdee605f6a53d5baffb23e4f0"`);
        await queryRunner.query(`ALTER TABLE "tool_favorites" DROP CONSTRAINT "FK_08687f88a37a213082bd0f90ea0"`);
        await queryRunner.query(`DROP TABLE "site_settings"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5d49c245604bbfa780a30ae97d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b8d67df2bc27d0af1b7caedcbc"`);
        await queryRunner.query(`DROP TABLE "admin_audit_logs"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c4bdee605f6a53d5baffb23e4f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08687f88a37a213082bd0f90ea"`);
        await queryRunner.query(`DROP TABLE "tool_favorites"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_577a9ddfdb8ebe33e89280d176"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c435f7a12371db979e76146f27"`);
        await queryRunner.query(`DROP TABLE "tools"`);
    }

}
