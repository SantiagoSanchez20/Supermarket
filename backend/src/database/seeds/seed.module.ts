import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Role,
  User,
  Category,
  Supplier,
  Product,
  Inventory,
  Customer,
  Promotion,
  Sale,
  SaleDetail,
  InventoryMovement,
  RestockingAlert,
} from '../entities';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Role,
      User,
      Category,
      Supplier,
      Product,
      Inventory,
      Customer,
      Promotion,
      Sale,
      SaleDetail,
      InventoryMovement,
      RestockingAlert,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
