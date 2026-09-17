import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from '@nestjs/common';
import { Roles } from '../../auth/decorators';
import { ProductService, SaleService, PosEngine } from './service';
import { buildPageQuery, reqContext } from '../../common/helpers';
import { Role } from '../../common/constants';

@Controller('products')
export class ProductController {
  constructor(private readonly svc: ProductService) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  create(@Req() req: any, @Body() body: any) { return this.svc.create(reqContext(req.user), body, 'Product'); }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.category) filters.category = q.category;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Get('low-stock')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  lowStock(@Req() req: any) {
    return this.svc.findAll(reqContext(req.user), { page: 1, limit: 50 } as any, {});
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }

  @Put(':id')
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  update(@Req() req: any, @Param('id') id: string, @Body() body: any) { return this.svc.update(reqContext(req.user), id, body, 'Product'); }

  @Delete(':id')
  @Roles(Role.OWNER, Role.MANAGER)
  remove(@Req() req: any, @Param('id') id: string) { return this.svc.remove(reqContext(req.user), id, 'Product'); }
}

@Controller('sales')
export class SaleController {
  constructor(
    private readonly svc: SaleService,
    private readonly engine: PosEngine,
  ) {}

  @Post()
  @Roles(Role.OWNER, Role.MANAGER, Role.STAFF)
  create(@Req() req: any, @Body() body: any) { return this.engine.createSale(req.user.tenantId, req.user.id, body); }

  @Get()
  findAll(@Req() req: any, @Query() q: any) {
    const filters: any = {};
    if (q.memberId) filters.memberId = q.memberId;
    return this.svc.findAll(reqContext(req.user), buildPageQuery(q), filters);
  }

  @Get('stats')
  stats(@Req() req: any, @Query('range') range: string) { return this.engine.getSalesStats(req.user.tenantId, range || 'month'); }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) { return this.svc.findOne(reqContext(req.user), id); }
}