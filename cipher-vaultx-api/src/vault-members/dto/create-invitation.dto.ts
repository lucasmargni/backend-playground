import { VaultRole } from '../entities/vault-role.enum';

export class CreateInvitationDto {
  email!: string;

  password!: string;

  role!: VaultRole;
}
