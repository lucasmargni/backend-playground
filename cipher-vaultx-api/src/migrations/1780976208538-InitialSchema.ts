import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1780976208538 implements MigrationInterface {
    name = 'InitialSchema1780976208538'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "secret" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "encryptedValue" bytea NOT NULL, "iv" bytea NOT NULL, "authTag" bytea NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "vaultId" uuid, CONSTRAINT "PK_6afa4961954e17ec2d6401afc3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vault" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "encryptedKey" bytea NOT NULL, "keyIv" bytea NOT NULL, "keyAuthTag" bytea NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_dd0898234c77f9d97585171ac59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "secret" ADD CONSTRAINT "FK_d9cb0b695e0c106670a72f65a8a" FOREIGN KEY ("vaultId") REFERENCES "vault"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vault" ADD CONSTRAINT "FK_81292a3b7eb9e7757a2202b5220" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vault" DROP CONSTRAINT "FK_81292a3b7eb9e7757a2202b5220"`);
        await queryRunner.query(`ALTER TABLE "secret" DROP CONSTRAINT "FK_d9cb0b695e0c106670a72f65a8a"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "vault"`);
        await queryRunner.query(`DROP TABLE "secret"`);
    }

}
