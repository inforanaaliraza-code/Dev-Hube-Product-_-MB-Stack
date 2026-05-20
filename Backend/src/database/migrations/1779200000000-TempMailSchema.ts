import { MigrationInterface, QueryRunner } from 'typeorm';

export class TempMailSchema1779200000000 implements MigrationInterface {
  name = 'TempMailSchema1779200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "temp_mailboxes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "address" character varying(320) NOT NULL,
        "provider" character varying(40) NOT NULL DEFAULT 'mail.tm',
        "provider_account_id" character varying(120) NOT NULL,
        "provider_password" character varying(120) NOT NULL,
        "bearer_token" text,
        "token_expires_at" TIMESTAMP WITH TIME ZONE,
        "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_temp_mailboxes" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_temp_mailboxes_address" ON "temp_mailboxes" ("address")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_temp_mailboxes_expires_at" ON "temp_mailboxes" ("expires_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_temp_mailboxes_expires_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_temp_mailboxes_address"`);
    await queryRunner.query(`DROP TABLE "temp_mailboxes"`);
  }
}
