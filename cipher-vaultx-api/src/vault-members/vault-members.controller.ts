import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { VaultMembersService } from './vault-members.service';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { VaultMember } from './entities/vault-member.entity';
import type { Request } from 'express';
import { Audit } from '../audit/decorators/audit.decorator';
import { AuditAction } from '../audit/entities/audit-action.enum';
import { AuditResourceType } from '../audit/entities/audit-resource-type.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('invitations')
@UseGuards(JwtGuard)
@ApiTags('invitations')
@ApiBearerAuth()
export class VaultMembersController {
  constructor(private readonly vaultMembersService: VaultMembersService) {}

  @Post('/:token/accept')
  @Audit(AuditAction.ACCEPTED, AuditResourceType.INVITATION)
  @ApiOperation({ summary: 'Accept a vault invitation using its token' })
  acceptInvitation(
    @Req() req: Request,
    @Param('token') token: string,
    @Body() dto: AcceptInvitationDto,
  ): Promise<VaultMember> {
    return this.vaultMembersService.acceptInvitation(token, req.user!, dto);
  }
}
