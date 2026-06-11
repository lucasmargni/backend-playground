import { MigrationInterface, QueryRunner } from "typeorm";

export class AddVaultInvitations1781217602530 implements MigrationInterface {
    name = 'AddVaultInvitations1781217602530'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."vault_invitation_role_enum" AS ENUM('owner', 'editor', 'viewer')`);
        await queryRunner.query(`CREATE TABLE "vault_invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."vault_invitation_role_enum" NOT NULL, "encryptedVaultKey" bytea NOT NULL, "iv" bytea NOT NULL, "authTag" bytea NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "invitedUserId" uuid, "vaultId" uuid, CONSTRAINT "UQ_5c43f51a5e0d8a871ccd916c84f" UNIQUE ("token"), CONSTRAINT "PK_15b56e8ebdfc90db2a3fe046a98" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "vault_invitation" ADD CONSTRAINT "FK_35d00e6878243d74069a7c65214" FOREIGN KEY ("invitedUserId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vault_invitation" ADD CONSTRAINT "FK_2b8310042bd5cf93a78ada53926" FOREIGN KEY ("vaultId") REFERENCES "vault"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vault_invitation" DROP CONSTRAINT "FK_2b8310042bd5cf93a78ada53926"`);
        await queryRunner.query(`ALTER TABLE "vault_invitation" DROP CONSTRAINT "FK_35d00e6878243d74069a7c65214"`);
        await queryRunner.query(`DROP TABLE "vault_invitation"`);
        await queryRunner.query(`DROP TYPE "public"."vault_invitation_role_enum"`);
    }

}
