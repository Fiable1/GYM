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

function isPostgres(): boolean {
  const t = (process.env.DB_TYPE || 'sqljs').toLowerCase();
  return t === 'postgres' || t === 'postgresql';
}

export function monthKey(expr: string): string {
  return isPostgres() ? `to_char(${expr}, 'YYYY-MM')` : `strftime('%Y-%m', ${expr})`;
}

export function hourKey(expr: string): string {
  return isPostgres() ? `to_char(${expr}, 'HH24')` : `strftime('%H', ${expr})`;
}