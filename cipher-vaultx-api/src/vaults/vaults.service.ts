import { Injectable, NotFoundException } from '@nestjs/common';
import { Vault } from './entities/vault.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateVaultDto } from './dto/create-vault.dto';
import { CryptoService } from '../crypto/crypto.service';
import { User } from '../users/entities/user.entity';
import { VaultMembersService } from '../vault-members/vault-members.service';
import { VaultAccess } from '../common/types';

@Injectable()
export class VaultsService {
  constructor(
    @InjectRepository(Vault)
    private readonly vaultRepository: Repository<Vault>,
    private readonly vaultMembersService: VaultMembersService,
    private readonly cryptoService: CryptoService,
  ) {}

  async create(dto: CreateVaultDto, user: User): Promise<Vault> {
    const vault = this.vaultRepository.create({
      name: dto.name,
    });

    await this.vaultRepository.save(vault);

    await this.vaultMembersService.createOwner(vault, user, dto.password);

    return vault;
  }

  findAllByUser(userId: string): Promise<Vault[]> {
    return this.vaultRepository.find({
      where: { members: { user: { id: userId } as User } },
    });
  }

  async findOneByUser(id: string, userId: string): Promise<VaultAccess> {
    const vault = await this.vaultRepository.findOne({
      where: { id, members: { user: { id: userId } as User } },
      relations: { members: { user: true } },
    });

    if (!vault) {
      throw new NotFoundException('Vault not found');
    }

    const member = vault.members.find((m) => m.user.id === userId);

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    return { vault, member };
  }
}
