import {
  Body,
  Controller,
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

@UseGuards(JwtGuard)
@Controller('vaults/:vaultId/secrets')
export class SecretsController {
  constructor(private readonly secretsService: SecretsService) {}

  @Get()
  getSecrets(
    @Req() req: Request,
    @Param('vaultId') vaultId: string,
  ): Promise<SecretSummary[]> {
    return this.secretsService.findAllByVault(vaultId, req.user!.id);
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
