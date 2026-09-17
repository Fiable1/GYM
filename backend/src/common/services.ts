import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { BaseEntity } from './base.entity';
import { AuditLog } from '../entities/communication.entities';

export class PageQuery {
  page: number = 1;
  limit: number = 20;
  search?: string;
  sortBy?: string;
  sortDir: 'ASC' | 'DESC' = 'DESC';
}

export class PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AuditService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async log(ctx: { tenantId?: string; actorId?: string }, entityName: string, entityId: string, action: string, oldValues?: any, newValues?: any) {
    try {
      await this.dataSource.getRepository(AuditLog).save({
        id: randomUUID(),
        tenantId: ctx.tenantId,
        entityName,
        entityId,
        action,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        createdBy: ctx.actorId,
      } as any);
    } catch {
      // audit logging must never break the main flow
    }
  }
}

export interface CrudFilters {
  [key: string]: any;
}

export class ApiBaseService<T extends BaseEntity> {
  constructor(
    protected readonly repo: Repository<T>,
    protected readonly audit: AuditService,
  ) {}

  private scoped(tenantId?: string) {
    return { tenantId } as FindOptionsWhere<T>;
  }

  async findAll(ctx: { tenantId: string }, q: PageQuery, extraFilters: CrudFilters = {}) {
    const qb = this.repo.createQueryBuilder('e');
    qb.where({ ...this.scoped(ctx.tenantId), ...extraFilters } as any as FindOptionsWhere<T>);
    qb.andWhere('e.deletedAt IS NULL');

    if (q.search) {
      qb.andWhere(`(CAST(e.id AS TEXT) LIKE :q OR e.name LIKE :q OR e.email LIKE :q OR e.title LIKE :q)`, {
        q: `%${q.search}%`,
      });
    }

    const total = await qb.getCount();

    if (q.sortBy) {
      qb.orderBy(`e.${q.sortBy}`, q.sortDir);
    } else {
      qb.orderBy('e.createdAt', 'DESC');
    }

    qb.skip((q.page - 1) * q.limit).take(q.limit);

    const items = await qb.getMany();
    return {
      items,
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.ceil(total / q.limit) || 1,
    } as PageResult<T>;
  }

  async findOne(ctx: { tenantId: string }, id: string): Promise<T> {
    const where = { id, ...this.scoped(ctx.tenantId) } as FindOptionsWhere<T>;
    const entity = await this.repo.findOne({ where });
    if (!entity) throw new NotFoundException(`${this.repo.metadata.tableName} not found`);
    return entity;
  }

  async create(ctx: { tenantId: string; actorId?: string }, dto: Partial<T>, entityName: string): Promise<T> {
    const entity = this.repo.create({
      ...(dto as any),
      tenantId: ctx.tenantId,
      createdBy: ctx.actorId,
    });
    const saved = (await this.repo.save(entity as any)) as T;
    await this.audit.log(ctx, entityName, (saved as any).id, 'CREATE', null, dto);
    return saved;
  }

  async update(ctx: { tenantId: string; actorId?: string }, id: string, dto: Partial<T>, entityName: string): Promise<T> {
    const existing = await this.findOne(ctx, id);
    const oldValues = { ...existing };
    const updated = this.repo.merge(existing, dto as any);
    const saved = (await this.repo.save(updated as any)) as T;
    await this.audit.log(ctx, entityName, id, 'UPDATE', oldValues, saved);
    return saved;
  }

  async remove(ctx: { tenantId: string; actorId?: string }, id: string, entityName: string): Promise<{ success: boolean }> {
    const existing = await this.findOne(ctx, id);
    existing.deletedAt = new Date();
    await this.repo.save(existing as any);
    await this.audit.log(ctx, entityName, id, 'DELETE', existing, null);
    return { success: true };
  }

  async hardDelete(ctx: { tenantId: string }, id: string): Promise<{ success: boolean }> {
    await this.findOne(ctx, id);
    await this.repo.delete(id);
    return { success: true };
  }

  async rawRepository(): Promise<Repository<T>> {
    return this.repo;
  }
}