import { MigrationInterface, QueryRunner } from 'typeorm';

export class QrGeneratorSchema1779210000000 implements MigrationInterface {
  name = 'QrGeneratorSchema1779210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "qr_codes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "short_code" character varying(16),
        "mode" character varying(16) NOT NULL,
        "content_type" character varying(16) NOT NULL,
        "payload" text NOT NULL,
        "encoded_data" text NOT NULL,
        "foreground_color" character varying(16) NOT NULL DEFAULT '#000000',
        "background_color" character varying(16) NOT NULL DEFAULT '#ffffff',
        "error_correction" character varying(2) NOT NULL DEFAULT 'H',
        "size_px" integer NOT NULL DEFAULT 512,
        "has_logo" boolean NOT NULL DEFAULT false,
        "logo_scale" double precision NOT NULL DEFAULT 0.22,
        "scan_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_qr_codes" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_qr_codes_short_code" ON "qr_codes" ("short_code") WHERE "short_code" IS NOT NULL`,
    );
    await queryRunner.query(`
      CREATE TABLE "qr_scans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "qr_code_id" uuid NOT NULL,
        "user_agent" character varying(512),
        "ip_hash" character varying(64),
        "referer" character varying(512),
        "scanned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_qr_scans" PRIMARY KEY ("id"),
        CONSTRAINT "FK_qr_scans_qr_code" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_qr_scans_qr_code_id" ON "qr_scans" ("qr_code_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_qr_scans_scanned_at" ON "qr_scans" ("scanned_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_qr_scans_scanned_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_qr_scans_qr_code_id"`);
    await queryRunner.query(`DROP TABLE "qr_scans"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_qr_codes_short_code"`);
    await queryRunner.query(`DROP TABLE "qr_codes"`);
  }
}
