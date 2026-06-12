import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AUDIT_KEY, AuditMetadata } from './decorators/audit.decorator';
import type { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metadata = this.reflector.get<AuditMetadata | undefined>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!metadata) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.user?.id ?? null;

    const getResourceId = (response: unknown): string => {
      if (
        typeof response === 'object' &&
        response !== null &&
        'id' in response
      ) {
        return (response as { id: string }).id;
      }
      return request.params.id as string;
    };

    return next.handle().pipe(
      tap((response) => {
        void this.auditService.log({
          userId,
          action: metadata.action,
          resourceType: metadata.resourceType,
          resourceId: getResourceId(response),
          success: true,
        });
      }),
      catchError((error) => {
        void this.auditService.log({
          userId,
          action: metadata.action,
          resourceType: metadata.resourceType,
          resourceId: request.params.id as string,
          success: false,
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        });
        throw error;
      }),
    );
  }
}
