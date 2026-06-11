import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../users/entities/user.entity';
import { Vault } from '../vaults/entities/vault.entity';
import { Secret } from '../secrets/entities/secret.entity';
import { VaultMember } from '../vault-members/entities/vault-member.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Vault, Secret, VaultMember],
  migrations: ['src/migrations/**/*.ts'],
});
