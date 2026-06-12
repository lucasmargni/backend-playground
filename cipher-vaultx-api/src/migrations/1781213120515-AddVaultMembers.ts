import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVaultMembers1781213120515 implements MigrationInterface {
    name = 'AddVaultMembers1781213120515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vault" DROP CONSTRAINT "FK_81292a3b7eb9e7757a2202b5220"`);
        await queryRunner.query(`CREATE TYPE "public"."vault_member_role_enum" AS ENUM('owner', 'editor', 'viewer')`);
        await queryRunner.query(`CREATE TABLE "vault_member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."vault_member_role_enum" NOT NULL, "encryptedKey" bytea NOT NULL, "keyIv" bytea NOT NULL, "keyAuthTag" bytea NOT NULL, "salt" bytea NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "vaultId" uuid, CONSTRAINT "PK_0202892cdf2e005081d5cb96817" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vault" DROP COLUMN "encryptedKey"`);
        await queryRunner.query(`ALTER TABLE "vault" DROP COLUMN "keyIv"`);
        await queryRunner.query(`ALTER TABLE "vault" DROP COLUMN "keyAuthTag"`);
        await queryRunner.query(`ALTER TABLE "vault" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "vault" DROP COLUMN "salt"`);
        await queryRunner.query(`ALTER TABLE "vault_member" ADD CONSTRAINT "FK_de5fc5f26ed5976fe9d4e8bbd57" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vault_member" ADD CONSTRAINT "FK_71838c9d230b8f6ed783e41638e" FOREIGN KEY ("vaultId") REFERENCES "vault"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vault_member" DROP CONSTRAINT "FK_71838c9d230b8f6ed783e41638e"`);
        await queryRunner.query(`ALTER TABLE "vault_member" DROP CONSTRAINT "FK_de5fc5f26ed5976fe9d4e8bbd57"`);
        await queryRunner.query(`ALTER TABLE "vault" ADD "salt" bytea NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vault" ADD "userId" uuid`);
        await queryRunner.query(`ALTER TABLE "vault" ADD "keyAuthTag" bytea NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vault" ADD "keyIv" bytea NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vault" ADD "encryptedKey" bytea NOT NULL`);
        await queryRunner.query(`DROP TABLE "vault_member"`);
        await queryRunner.query(`DROP TYPE "public"."vault_member_role_enum"`);
        await queryRunner.query(`ALTER TABLE "vault" ADD CONSTRAINT "FK_81292a3b7eb9e7757a2202b5220" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
