import { AuditAction } from '../../audit/entities/audit-action.enum';
import { AuditResourceType } from '../../audit/entities/audit-resource-type.enum';
import { VaultMember } from '../../vault-members/entities/vault-member.entity';
import { VaultRole } from '../../vault-members/entities/vault-role.enum';
import { Vault } from '../../vaults/entities/vault.entity';

export type AuthResponse = { accessToken: string };

export interface JwtPayload {
  sub: string;
  email: string;
}

export type EncryptResponse = {
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
};

export type VaultKeyResponse = EncryptResponse & { salt: Buffer };

export type SecretResponse = {
  name: string;
  value: string;
};

export type SecretSummary = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
};

export type VaultAccess = {
  vault: Vault;
  member: VaultMember;
};

export type VaultDetail = {
  vault: Vault;
  role: VaultRole;
};

export type Token = {
  token: string;
};

export type AuditLogEntry = {
  userId: string | null;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string;
  success: boolean;
  errorMessage?: string | null;
};
