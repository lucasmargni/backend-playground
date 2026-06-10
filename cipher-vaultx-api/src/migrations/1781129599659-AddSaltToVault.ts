import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSaltToVault1781129599659 implements MigrationInterface {
    name = 'AddSaltToVault1781129599659'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vault" ADD "salt" bytea NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vault" DROP COLUMN "salt"`);
    }

}
