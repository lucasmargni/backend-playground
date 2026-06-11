import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { VaultMember } from './entities/vault-member.entity';
import { Repository } from 'typeorm';
import { CryptoService } from '../crypto/crypto.service';
import { Vault } from '../vaults/entities/vault.entity';
import { User } from '../users/entities/user.entity';
import { VaultRole } from './entities/vault-role.enum';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Token } from '../common/types';
import { UsersService } from '../users/users.service';
import { VaultInvitation } from './entities/vault-invitation.entity';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';

@Injectable()
export class VaultMembersService {
  constructor(
    @InjectRepository(VaultMember)
    private readonly vaultMemberRepository: Repository<VaultMember>,
    @InjectRepository(VaultInvitation)
    private readonly vaultInvitationRepository: Repository<VaultInvitation>,
    private readonly usersService: UsersService,
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

  async createInvitation(
    vault: Vault,
    member: VaultMember,
    dto: CreateInvitationDto,
  ): Promise<Token> {
    if (member.role !== VaultRole.OWNER) {
      throw new ForbiddenException(
        'User not has permission to add a member to this vault',
      );
    }

    if (dto.role === VaultRole.OWNER) {
      throw new BadRequestException('Not possible to invite as owner');
    }

    const invitedUser = await this.usersService.findByEmail(dto.email);

    if (!invitedUser) {
      throw new NotFoundException('User not found');
    }

    const vaultKey = this.cryptoService.decryptVaultKey(
      member.encryptedKey,
      member.keyIv,
      member.keyAuthTag,
      dto.password,
      member.salt,
    );

    const token = this.cryptoService.generateToken();

    const keyMaterial = this.cryptoService.encrypt(
      vaultKey,
      Buffer.from(token, 'hex'),
    );

    const invitation = this.vaultInvitationRepository.create({
      role: dto.role,
      encryptedVaultKey: keyMaterial.encrypted,
      iv: keyMaterial.iv,
      authTag: keyMaterial.authTag,
      token,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      invitedUser,
      vault,
    });

    await this.vaultInvitationRepository.save(invitation);

    return { token };
  }

  async acceptInvitation(
    token: string,
    user: User,
    dto: AcceptInvitationDto,
  ): Promise<VaultMember> {
    const invitation = await this.vaultInvitationRepository.findOne({
      where: { token },
      relations: { vault: true, invitedUser: true },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.invitedUser.id !== user.id) {
      throw new ForbiddenException(
        'User has not permission to accept invitation',
      );
    }

    if (invitation.expiresAt < new Date()) {
      await this.vaultInvitationRepository.delete(invitation.id);
      throw new BadRequestException('Invitation has expired');
    }

    const vaultKey = this.cryptoService.decrypt(
      invitation.encryptedVaultKey,
      Buffer.from(invitation.token, 'hex'),
      invitation.iv,
      invitation.authTag,
    );

    const invitedUser = await this.addMember(
      invitation.vault,
      vaultKey,
      user,
      dto.password,
      invitation.role,
    );

    await this.vaultInvitationRepository.delete(invitation.id);

    return invitedUser;
  }
}
