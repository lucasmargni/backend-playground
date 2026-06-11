import { Module } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsController } from './secrets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Secret } from './entities/secret.entity';
import { Vault } from '../vaults/entities/vault.entity';
import { VaultsModule } from '../vaults/vaults.module';

@Module({
  imports: [TypeOrmModule.forFeature([Secret, Vault]), VaultsModule],
  providers: [SecretsService],
  controllers: [SecretsController],
})
export class SecretsModule {}
