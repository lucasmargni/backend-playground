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

@UseGuards(JwtGuard)
@Controller('vaults')
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) {}

  @Get()
  getVaults(@Req() req: Request): Promise<Vault[]> {
    return this.vaultsService.findAllByUser(req.user!.id);
  }

  @Get('/:id')
  getVaultById(@Req() req: Request, @Param('id') id: string): Promise<Vault> {
    return this.vaultsService.findOneByUser(id, req.user!.id);
  }

  @Post()
  createVault(
    @Req() req: Request,
    @Body() dto: CreateVaultDto,
  ): Promise<Vault> {
    return this.vaultsService.create(dto, req.user!.id);
  }
}
