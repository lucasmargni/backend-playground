import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditLog1781222334755 implements MigrationInterface {
    name = 'AddAuditLog1781222334755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audit_log_action_enum" AS ENUM('created', 'unlocked', 'invited', 'accepted')`);
        await queryRunner.query(`CREATE TYPE "public"."audit_log_resourcetype_enum" AS ENUM('vault', 'secret', 'invitation')`);
        await queryRunner.query(`CREATE TABLE "audit_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "action" "public"."audit_log_action_enum" NOT NULL, "resourceType" "public"."audit_log_resourcetype_enum" NOT NULL, "resourceId" uuid NOT NULL, "success" boolean NOT NULL, "errorMessage" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_07fefa57f7f5ab8fc3f52b3ed0b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "audit_log"`);
        await queryRunner.query(`DROP TYPE "public"."audit_log_resourcetype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."audit_log_action_enum"`);
    }

}
