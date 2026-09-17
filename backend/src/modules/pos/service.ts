import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Sale, SaleItem } from '../../entities/pos.entities';
import { ApiBaseService, AuditService } from '../../common/services';

@Injectable()
export class ProductService extends ApiBaseService<Product> {
  constructor(@InjectRepository(Product) r: Repository<Product>, a: AuditService) { super(r, a); }
}

@Injectable()
export class SaleService extends ApiBaseService<Sale> {
  constructor(@InjectRepository(Sale) r: Repository<Sale>, a: AuditService) { super(r, a); }
}

@Injectable()
export class SaleItemService extends ApiBaseService<SaleItem> {
  constructor(@InjectRepository(SaleItem) r: Repository<SaleItem>, a: AuditService) { super(r, a); }
}

@Injectable()
export class PosEngine {
  constructor(
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Sale) private readonly saleRepo: Repository<Sale>,
    @InjectRepository(SaleItem) private readonly itemRepo: Repository<SaleItem>,
  ) {}

  async createSale(tenantId: string, actorId: string, body: {
    items: { productId: string; quantity: number }[];
    memberId?: string;
    paymentMethod?: string;
    locationId?: string;
    discount?: number;
  }) {
    if (!body.items?.length) throw new BadRequestException('No items in sale');

    const subtotalItems: any[] = [];
    let subtotal = 0;

    for (const it of body.items) {
      const product = await this.productRepo.findOne({ where: { id: it.productId, tenantId } });
      if (!product) throw new BadRequestException(`Product ${it.productId} not found`);
      if (product.stockQuantity < it.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }
      const total = product.price * it.quantity;
      subtotal += total;
      subtotalItems.push({ product, quantity: it.quantity, unitPrice: product.price, total });
    }

    const tax = subtotal * 0.08;
    const discount = body.discount || 0;
    const total = Math.max(0, subtotal + tax - discount);

    const sale = await this.saleRepo.save(this.saleRepo.create({
      tenantId,
      createdBy: actorId,
      memberId: body.memberId,
      soldById: actorId,
      locationId: body.locationId,
      soldAt: new Date(),
      saleType: 'POS',
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: body.paymentMethod || 'CASH',
      status: 'COMPLETED',
    }));

    for (const si of subtotalItems) {
      await this.itemRepo.save(this.itemRepo.create({
        tenantId, saleId: sale.id, productId: si.product.id,
        productName: si.product.name, quantity: si.quantity,
        unitPrice: si.unitPrice, total: si.total,
      }));
      si.product.stockQuantity -= si.quantity;
      await this.productRepo.save(si.product);
    }

    return { ...sale, items: subtotalItems.map((si) => ({ ...si, product: undefined })) };
  }

  async getSalesStats(tenantId: string, range: string = 'month') {
    const now = new Date();
    let since: Date;
    if (range === 'today') since = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (range === 'week') since = new Date(now.getTime() - 7 * 86400000);
    else since = new Date(now.getTime() - 30 * 86400000);

    const result = await this.saleRepo.createQueryBuilder('s')
      .where('s.tenantId = :t', { t: tenantId })
      .andWhere('s.soldAt >= :since', { since: since.toISOString() })
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(s.total),0)', 'revenue')
      .getRawOne();

    const byDay = await this.saleRepo.createQueryBuilder('s')
      .where('s.tenantId = :t', { t: tenantId })
      .andWhere('s.soldAt >= :since', { since: since.toISOString() })
      .select("date(s.soldAt)", 'day')
      .addSelect('COALESCE(SUM(s.total),0)', 'revenue')
      .groupBy("date(s.soldAt)")
      .orderBy('day', 'ASC')
      .getRawMany();

    const topProducts = await this.itemRepo.createQueryBuilder('i')
      .select('i.productName', 'name')
      .addSelect('SUM(i.quantity)', 'qty')
      .addSelect('SUM(i.total)', 'total')
      .where('i.tenantId = :t', { t: tenantId })
      .groupBy('i.productName')
      .orderBy('total', 'DESC')
      .limit(5)
      .getRawMany();

    const lowStock = await this.productRepo.createQueryBuilder('p')
      .where('p.tenantId = :t', { t: tenantId })
      .andWhere('p.stockQuantity <= p.lowStockThreshold')
      .getMany();

    return {
      count: Number(result?.count || 0),
      revenue: Number(result?.revenue || 0),
      byDay,
      topProducts,
      lowStockProducts: lowStock,
    };
  }
}