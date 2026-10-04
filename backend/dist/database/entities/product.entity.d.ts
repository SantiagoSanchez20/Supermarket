import { Category } from './category.entity';
import { Supplier } from './supplier.entity';
import { Inventory } from './inventory.entity';
import { Promotion } from './promotion.entity';
import { SaleDetail } from './sale-detail.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { RestockingAlert } from './restocking-alert.entity';
export declare class Product {
    id: string;
    sku: string;
    name: string;
    description: string;
    price: number;
    categoryId: string;
    category: Category;
    supplierId: string;
    supplier: Supplier;
    minStockSafety: number;
    avgDailySales: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    inventory: Inventory;
    promotions: Promotion[];
    saleDetails: SaleDetail[];
    movements: InventoryMovement[];
    alerts: RestockingAlert[];
}
