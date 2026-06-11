import { Module } from '@nestjs/common';
import { VaultMembersService } from './vault-members.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultMember } from './entities/vault-member.entity';
import { User } from '../users/entities/user.entity';
import { Vault } from '../vaults/entities/vault.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VaultMember, User, Vault])],
  providers: [VaultMembersService],
  exports: [VaultMembersService],
})
export class VaultMembersModule {}
