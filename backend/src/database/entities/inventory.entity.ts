import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('inventory')
@Check(`"current_stock" >= 0`)
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', unique: true })
  productId: string;

  @OneToOne(() => Product, (product) => product.inventory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'current_stock', type: 'int', default: 0 })
  currentStock: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
