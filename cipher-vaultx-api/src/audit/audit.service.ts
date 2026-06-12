import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditLogEntry } from '../common/types';
import { AuditResourceType } from './entities/audit-resource-type.enum';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(entry: AuditLogEntry): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create(entry);

    return this.auditLogRepository.save(auditLog);
  }

  findByVault(vaultId: string, secretsIds: string[]): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: [
        { resourceType: AuditResourceType.VAULT, resourceId: vaultId },
        { resourceType: AuditResourceType.SECRET, resourceId: In(secretsIds) },
      ],
      order: { createdAt: 'DESC' },
    });
  }
}
