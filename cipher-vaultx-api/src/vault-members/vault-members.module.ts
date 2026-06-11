import { Module } from '@nestjs/common';
import { VaultMembersService } from './vault-members.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VaultMember } from './entities/vault-member.entity';
import { User } from '../users/entities/user.entity';
import { Vault } from '../vaults/entities/vault.entity';
import { VaultInvitation } from './entities/vault-invitation.entity';
import { UsersModule } from '../users/users.module';
import { VaultMembersController } from './vault-members.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([VaultMember, VaultInvitation, User, Vault]),
    UsersModule,
  ],
  providers: [VaultMembersService],
  exports: [VaultMembersService],
  controllers: [VaultMembersController],
})
export class VaultMembersModule {}
