import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { AdminAuditLogEntity } from './entities/admin-audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AdminAuditLogEntity)
    private readonly auditRepo: Repository<AdminAuditLogEntity>,
  ) {}

  async log(
    user: UserEntity | null,
    action: string,
    entityType: string,
    entityId?: string,
    metadata?: Record<string, unknown>,
  ) {
    const entry = this.auditRepo.create({
      userId: user?.id ?? null,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ?? null,
    });
    await this.auditRepo.save(entry);
  }
}
