import { Injectable, NotFoundException } from '@nestjs/common';
import { Secret } from './entities/secret.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CryptoService } from '../crypto/crypto.service';
import { CreateSecretDto } from './dto/create-secret.dto';
import { Vault } from '../vaults/entities/vault.entity';
import { VaultsService } from '../vaults/vaults.service';
import { UnlockVaultDto } from './dto/unlock-vault.dto';
import { SecretResponse, SecretSummary } from '../common/types';

@Injectable()
export class SecretsService {
  constructor(
    @InjectRepository(Secret)
    private readonly secretRepository: Repository<Secret>,
    private readonly vaultsService: VaultsService,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(
    dto: CreateSecretDto,
    vaultId: string,
    userId: string,
  ): Promise<Secret> {
    const { member } = await this.vaultsService.findOneByUser(vaultId, userId);

    const vaultKey = this.cryptoService.decryptVaultKey(
      member.encryptedKey,
      member.keyIv,
      member.keyAuthTag,
      dto.password,
      member.salt,
    );

    const encrypted = this.cryptoService.encryptSecret(dto.value, vaultKey);

    const secret = this.secretRepository.create({
      name: dto.name,
      description: dto.description,
      encryptedValue: encrypted.encrypted,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      vault: { id: vaultId } as Vault,
    });

    return this.secretRepository.save(secret);
  }

  async findAllByVault(
    vaultId: string,
    userId: string,
  ): Promise<SecretSummary[]> {
    await this.vaultsService.findOneByUser(vaultId, userId);

    const secrets = await this.secretRepository.find({
      where: { vault: { id: vaultId } as Vault },
    });

    return secrets.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      createdAt: s.createdAt,
    }));
  }

  async findOneAndDecrypt(
    id: string,
    vaultId: string,
    userId: string,
    dto: UnlockVaultDto,
  ): Promise<SecretResponse> {
    const { member } = await this.vaultsService.findOneByUser(vaultId, userId);

    const secret = await this.secretRepository.findOne({
      where: { id, vault: { id: vaultId } as Vault },
    });

    if (!secret) {
      throw new NotFoundException('Secret not found');
    }

    const vaultKey = this.cryptoService.decryptVaultKey(
      member.encryptedKey,
      member.keyIv,
      member.keyAuthTag,
      dto.password,
      member.salt,
    );

    const secretValue = this.cryptoService.decryptSecret(
      secret.encryptedValue,
      secret.iv,
      secret.authTag,
      vaultKey,
    );

    return { name: secret.name, value: secretValue };
  }
}
