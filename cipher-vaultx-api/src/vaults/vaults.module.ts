import { Module } from '@nestjs/common';
import { VaultsService } from './vaults.service';
import { VaultsController } from './vaults.controller';
import { Vault } from './entities/vault.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultMembersModule } from '../vault-members/vault-members.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vault]), VaultMembersModule],
  providers: [VaultsService],
  controllers: [VaultsController],
  exports: [VaultsService],
})
export class VaultsModule {}
