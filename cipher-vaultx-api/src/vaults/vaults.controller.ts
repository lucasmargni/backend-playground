import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VaultsService } from './vaults.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Vault } from './entities/vault.entity';
import type { Request } from 'express';
import { CreateVaultDto } from './dto/create-vault.dto';
import { Token, VaultDetail } from '../common/types';
import { VaultMembersService } from '../vault-members/vault-members.service';
import { CreateInvitationDto } from '../vault-members/dto/create-invitation.dto';
import { Audit } from '../audit/decorators/audit.decorator';
import { AuditAction } from '../audit/entities/audit-action.enum';
import { AuditResourceType } from '../audit/entities/audit-resource-type.enum';

@UseGuards(JwtGuard)
@Controller('vaults')
export class VaultsController {
  constructor(
    private readonly vaultsService: VaultsService,
    private readonly vaultMembersService: VaultMembersService,
  ) {}

  @Get()
  getVaults(@Req() req: Request): Promise<Vault[]> {
    return this.vaultsService.findAllByUser(req.user!.id);
  }

  @Get('/:id')
  async getVaultById(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<VaultDetail> {
    const { vault, member } = await this.vaultsService.findOneByUser(
      id,
      req.user!.id,
    );

    return { vault, role: member.role };
  }

  @Post()
  @Audit(AuditAction.CREATED, AuditResourceType.VAULT)
  createVault(
    @Req() req: Request,
    @Body() dto: CreateVaultDto,
  ): Promise<Vault> {
    return this.vaultsService.create(dto, req.user!);
  }

  @Post('/:id/invitations')
  async inviteUser(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: CreateInvitationDto,
  ): Promise<Token> {
    const { vault, member } = await this.vaultsService.findOneByUser(
      id,
      req.user!.id,
    );

    return this.vaultMembersService.createInvitation(vault, member, dto);
  }
}
