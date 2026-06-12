import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { VaultRole } from '../entities/vault-role.enum';

export class CreateInvitationDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsEnum(VaultRole)
  role!: VaultRole;
}
