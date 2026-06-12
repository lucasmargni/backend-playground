import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../entities/audit-action.enum';
import { AuditResourceType } from '../entities/audit-resource-type.enum';

export const AUDIT_KEY = 'audit';

export type AuditMetadata = {
  action: AuditAction;
  resourceType: AuditResourceType;
};

export const Audit = (action: AuditAction, resourceType: AuditResourceType) =>
  SetMetadata(AUDIT_KEY, { action, resourceType });
