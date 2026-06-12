import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { SecretsService } from './secrets.service';
import { SecretResponse, SecretSummary } from '../common/types';
import type { Request } from 'express';
import { CreateSecretDto } from './dto/create-secret.dto';
import { Secret } from './entities/secret.entity';
import { UnlockVaultDto } from './dto/unlock-vault.dto';
import { Audit } from '../audit/decorators/audit.decorator';
import { AuditAction } from '../audit/entities/audit-action.enum';
import { AuditResourceType } from '../audit/entities/audit-resource-type.enum';
import { VaultsService } from '../vaults/vaults.service';
import { AuditService } from '../audit/audit.service';
import { VaultRole } from '../vault-members/entities/vault-role.enum';
import { AuditLog } from '../audit/entities/audit-log.entity';

@UseGuards(JwtGuard)
@Controller('vaults/:vaultId/secrets')
export class SecretsController {
  constructor(
    private readonly secretsService: SecretsService,
    private readonly vaultsService: VaultsService,
    private readonly auditService: AuditService,
  ) {}

  @Get()
  getSecrets(
    @Req() req: Request,
    @Param('vaultId') vaultId: string,
  ): Promise<SecretSummary[]> {
    return this.secretsService.findAllByVault(vaultId, req.user!.id);
  }

  @Get('/audit-logs')
  async getAuditLogs(
    @Req() req: Request,
    @Param('vaultId') vaultId: string,
  ): Promise<AuditLog[]> {
    const { member } = await this.vaultsService.findOneByUser(
      vaultId,
      req.user!.id,
    );

    if (member.role !== VaultRole.OWNER) {
      throw new ForbiddenException('Only owners can view audit logs');
    }

    const secretIds = await this.secretsService.findIdsByVault(vaultId);
    return this.auditService.findByVault(vaultId, secretIds);
  }

  @Post()
  @Audit(AuditAction.CREATED, AuditResourceType.SECRET)
  createSecret(
    @Req() req: Request,
    @Param('vaultId') vaultId: string,
    @Body() dto: CreateSecretDto,
  ): Promise<Secret> {
    return this.secretsService.create(dto, vaultId, req.user!.id);
  }

  @Post('/:id/unlock')
  @Audit(AuditAction.UNLOCKED, AuditResourceType.SECRET)
  unlockSecret(
    @Req() req: Request,
    @Param('vaultId') vaultId: string,
    @Param('id') id: string,
    @Body() dto: UnlockVaultDto,
  ): Promise<SecretResponse> {
    return this.secretsService.findOneAndDecrypt(
      id,
      vaultId,
      req.user!.id,
      dto,
    );
  }
}
