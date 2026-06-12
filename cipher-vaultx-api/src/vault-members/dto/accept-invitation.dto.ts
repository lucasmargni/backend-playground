import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({ example: 'MyP@ssw0rd' })
  @IsNotEmpty()
  @IsString()
  password!: string;
}
