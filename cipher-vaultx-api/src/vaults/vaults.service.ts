import { Injectable, NotFoundException } from '@nestjs/common';
import { Vault } from './entities/vault.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVaultDto } from './dto/create-vault.dto';
import { CryptoService } from '../crypto/crypto.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class VaultsService {
  constructor(
    @InjectRepository(Vault)
    private readonly vaultRepository: Repository<Vault>,
    private readonly cryptoService: CryptoService,
  ) {}

  create(dto: CreateVaultDto, userId: string): Promise<Vault> {
    const vaultKey = this.cryptoService.generateVaultKey(dto.password);

    const vault = this.vaultRepository.create({
      name: dto.name,
      encryptedKey: vaultKey.encrypted,
      keyIv: vaultKey.iv,
      keyAuthTag: vaultKey.authTag,
      salt: vaultKey.salt,
      user: { id: userId } as User,
    });

    return this.vaultRepository.save(vault);
  }

  findAllByUser(userId: string): Promise<Vault[]> {
    return this.vaultRepository.find({
      where: { user: { id: userId } as User },
    });
  }

  async findOneByUser(id: string, userId: string): Promise<Vault> {
    const vault = await this.vaultRepository.findOne({
      where: { id, user: { id: userId } as User },
    });

    if (!vault) {
      throw new NotFoundException('Vault not found');
    }

    return vault;
  }
}
