import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Sale, SaleItem } from '../../entities/pos.entities';
import { ProductService, SaleService, SaleItemService, PosEngine } from './service';
import { ProductController, SaleController } from './controller';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Sale, SaleItem])],
  controllers: [ProductController, SaleController],
  providers: [ProductService, SaleService, SaleItemService, PosEngine],
  exports: [PosEngine],
})
export class PosModule {}