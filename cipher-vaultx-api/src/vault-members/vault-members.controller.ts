import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { VaultMembersService } from './vault-members.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { VaultMember } from './entities/vault-member.entity';
import type { Request } from 'express';

@UseGuards(JwtGuard)
@Controller('invitations')
export class VaultMembersController {
  constructor(private readonly vaultMembersService: VaultMembersService) {}

  @Post('/:token/accept')
  acceptInvitation(
    @Req() req: Request,
    @Param('token') token: string,
    @Body() dto: AcceptInvitationDto,
  ): Promise<VaultMember> {
    return this.vaultMembersService.acceptInvitation(token, req.user!, dto);
  }
}
