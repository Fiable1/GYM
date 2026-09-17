import { Injectable } from '@nestjs/common';
import { PageQuery } from './services';

export function reqContext(user: any): { tenantId: string; actorId: string } {
  return { tenantId: user?.tenantId, actorId: user?.id };
}

export function buildPageQuery(q: any): PageQuery {
  return {
    page: Math.max(1, parseInt(q.page) || 1),
    limit: Math.min(100, Math.max(1, parseInt(q.limit) || 20)),
    search: q.search || undefined,
    sortBy: q.sortBy || undefined,
    sortDir: (q.sortDir === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC',
  };
}