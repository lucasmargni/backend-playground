import { Reflector } from '@nestjs/core';
import { AuditInterceptor } from './audit.interceptor';
import { AuditService } from './audit.service';

describe('AuditInterceptor', () => {
  it('should be defined', () => {
    const reflector = new Reflector();
    const auditService = {} as AuditService;
    expect(new AuditInterceptor(reflector, auditService)).toBeDefined();
  });
});
