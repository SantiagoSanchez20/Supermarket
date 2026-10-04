import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Product } from './product.entity';

export enum AlertPriority {
  ALTA = 'ALTA', // stock <= stock de seguridad o stock == 0
  MEDIA = 'MEDIA', // stock <= punto de reposición / 2
  BAJA = 'BAJA', // stock <= punto de reposición
}

@Entity('restocking_alerts')
export class RestockingAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.alerts, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'current_stock', type: 'int' })
  currentStock: number;

  @Column({ name: 'reorder_point', type: 'int' })
  reorderPoint: number;

  @Column({
    type: 'varchar',
    default: AlertPriority.MEDIA,
  })
  priority: AlertPriority;

  @Column({ name: 'is_resolved', default: false })
  isResolved: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt?: Date;
}
