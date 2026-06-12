import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { VaultRole } from '../entities/vault-role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvitationDto {
  @ApiProperty({ example: 'lucas@example.com' })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'MyP@ssw0rd' })
  @IsNotEmpty()
  @IsString()
  password!: string;

  @ApiProperty({ example: 'editor' })
  @IsNotEmpty()
  @IsEnum(VaultRole)
  role!: VaultRole;
}
