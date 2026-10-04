import { User } from './user.entity';
import { Customer } from './customer.entity';
import { SaleDetail } from './sale-detail.entity';
import { InventoryMovement } from './inventory-movement.entity';
export declare enum SaleStatus {
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED"
}
export declare class Sale {
    id: string;
    saleNumber: string;
    userId: string;
    user: User;
    customerId?: string;
    customer?: Customer;
    subtotal: number;
    totalDiscount: number;
    total: number;
    status: SaleStatus;
    createdAt: Date;
    updatedAt: Date;
    details: SaleDetail[];
    movements: InventoryMovement[];
}
