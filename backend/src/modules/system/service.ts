import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { AuditLog } from '../../entities/communication.entities';
import { PageQuery, PageResult } from '../../common/services';
import { User } from '../../entities/user.entity';

@Injectable()
export class AuditServiceView {
  constructor(@InjectRepository(AuditLog) private readonly repo: Repository<AuditLog>) {}

  async findAll(tenantId: string, q: PageQuery): Promise<PageResult<AuditLog>> {
    const qb = this.repo.createQueryBuilder('a');
    qb.where('a.tenantId = :t', { t: tenantId });
    if (q.search) {
      qb.andWhere('(a.entityName LIKE :s OR a.action LIKE :s OR a.entityId LIKE :s)', { s: `%${q.search}%` });
    }
    if (q.sortBy) qb.orderBy(`a.${q.sortBy}`, q.sortDir);
    else qb.orderBy('a.createdAt', 'DESC');

    const total = await qb.getCount();
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const items = await qb.getMany();

    const actorIds = [...new Set(items.map((i) => i.createdBy).filter(Boolean))];
    const actors = actorIds.length ? await this.repo.manager.getRepository(User).find({ where: { id: In(actorIds) } }) : [];
    const actorMap = new Map(actors.map((u) => [u.id, `${u.firstName} ${u.lastName || ''}`]));

    const enriched = items.map((i) => ({
      ...i,
      actorName: actorMap.get(i.createdBy) || 'System',
    })) as any;

    return {
      items: enriched,
      total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) || 1,
    } as any;
  }
}

@Injectable()
export class LocalizationService {
  private translations: Record<string, Record<string, string>> = {
    en: {
      appTitle: 'PulseForge',
      dashboard: 'Dashboard',
      welcome: 'Welcome back',
      totalMembers: 'Total Members',
      revenue: 'Revenue',
      checkIns: 'Check-ins',
      classes: 'Classes',
      save: 'Save',
      cancel: 'Cancel',
      search: 'Search',
      actions: 'Actions',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
    },
    es: {
      appTitle: 'PulseForge',
      dashboard: 'Panel',
      welcome: 'Bienvenido de nuevo',
      totalMembers: 'Miembros Totales',
      revenue: 'Ingresos',
      checkIns: 'Registros',
      classes: 'Clases',
      save: 'Guardar',
      cancel: 'Cancelar',
      search: 'Buscar',
      actions: 'Acciones',
      status: 'Estado',
      active: 'Activo',
      inactive: 'Inactivo',
    },
    fr: {
      appTitle: 'PulseForge',
      dashboard: 'Tableau de bord',
      welcome: 'Bon retour',
      totalMembers: 'Membres totaux',
      revenue: 'Revenus',
      checkIns: 'Enregistrements',
      classes: 'Cours',
      save: 'Enregistrer',
      cancel: 'Annuler',
      search: 'Rechercher',
      actions: 'Actions',
      status: 'Statut',
      active: 'Actif',
      inactive: 'Inactif',
    },
  };

  get(key: string, lang: string): string {
    return this.translations[lang]?.[key] || this.translations.en[key] || key;
  }

  listLanguages() {
    return [
      { code: 'en', name: 'English', direction: 'ltr' },
      { code: 'es', name: 'Español', direction: 'ltr' },
      { code: 'fr', name: 'Français', direction: 'ltr' },
      { code: 'pt', name: 'Português', direction: 'ltr' },
      { code: 'ar', name: 'العربية', direction: 'rtl' },
      { code: 'hi', name: 'हिन्दी', direction: 'ltr' },
      { code: 'sw', name: 'Kiswahili', direction: 'ltr' },
      { code: 'zh', name: '简体中文', direction: 'ltr' },
    ];
  }
}