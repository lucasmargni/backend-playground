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
  createSecret(
    @Req() req: Request,
    @Param('vaultId') vaultId: string,
    @Body() dto: CreateSecretDto,
  ): Promise<Secret> {
    return this.secretsService.create(dto, vaultId, req.user!.id);
  }

  @Post('/:id/unlock')
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
