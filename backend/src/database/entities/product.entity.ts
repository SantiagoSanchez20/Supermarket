import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { Category } from './category.entity';
import { Supplier } from './supplier.entity';
import { Inventory } from './inventory.entity';
import { Promotion } from './promotion.entity';
import { SaleDetail } from './sale-detail.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { RestockingAlert } from './restocking-alert.entity';

@Entity('products')
@Check(`"price" > 0`)
@Check(`"min_stock_safety" >= 0`)
@Check(`"avg_daily_sales" >= 0`)
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ name: 'supplier_id' })
  supplierId: string;

  @ManyToOne(() => Supplier, (supplier) => supplier.products, { eager: true })
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'min_stock_safety', type: 'int', default: 10 })
  minStockSafety: number; // Stock de seguridad (usado en RB-07)

  @Column({ name: 'avg_daily_sales', type: 'decimal', precision: 10, scale: 2, default: 5.0 })
  avgDailySales: number; // Ventas promedio diarias (usado en RB-07)

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Inventory, (inventory) => inventory.product)
  inventory: Inventory;

  @ManyToMany(() => Promotion, (promotion) => promotion.products)
  @JoinTable({
    name: 'product_promotions',
    joinColumn: { name: 'product_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
  })
  promotions: Promotion[];

  @OneToMany(() => SaleDetail, (detail) => detail.product)
  saleDetails: SaleDetail[];

  @OneToMany(() => InventoryMovement, (mov) => mov.product)
  movements: InventoryMovement[];

  @OneToMany(() => RestockingAlert, (alert) => alert.product)
  alerts: RestockingAlert[];
}
