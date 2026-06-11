import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VaultMember } from './entities/vault-member.entity';
import { Repository } from 'typeorm';
import { CryptoService } from '../crypto/crypto.service';
import { Vault } from '../vaults/entities/vault.entity';
import { User } from '../users/entities/user.entity';
import { VaultRole } from './entities/vault-role.enum';

@Injectable()
export class VaultMembersService {
  constructor(
    @InjectRepository(VaultMember)
    private readonly vaultMemberRepository: Repository<VaultMember>,
    private readonly cryptoService: CryptoService,
  ) {}

  createOwner(
    vault: Vault,
    user: User,
    password: string,
  ): Promise<VaultMember> {
    const keyMaterial = this.cryptoService.generateVaultKey(password);

    const vaultMember = this.vaultMemberRepository.create({
      role: VaultRole.OWNER,
      encryptedKey: keyMaterial.encrypted,
      keyIv: keyMaterial.iv,
      keyAuthTag: keyMaterial.authTag,
      salt: keyMaterial.salt,
      user,
      vault,
    });

    return this.vaultMemberRepository.save(vaultMember);
  }

  addMember(
    vault: Vault,
    vaultKey: Buffer,
    user: User,
    password: string,
    role: VaultRole,
  ): Promise<VaultMember> {
    const keyMaterial = this.cryptoService.wrapVaultKey(vaultKey, password);

    const vaultMember = this.vaultMemberRepository.create({
      role,
      encryptedKey: keyMaterial.encrypted,
      keyIv: keyMaterial.iv,
      keyAuthTag: keyMaterial.authTag,
      salt: keyMaterial.salt,
      user,
      vault,
    });

    return this.vaultMemberRepository.save(vaultMember);
  }
}
