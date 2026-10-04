import { Product } from './product.entity';
import { Sale } from './sale.entity';
import { User } from './user.entity';
export declare enum MovementType {
    VENTA = "VENTA",
    ENTRADA = "ENTRADA",
    AJUSTE = "AJUSTE"
}
export declare class InventoryMovement {
    id: string;
    productId: string;
    product: Product;
    saleId?: string;
    sale?: Sale;
    userId?: string;
    user?: User;
    movementType: MovementType;
    quantity: number;
    previousStock: number;
    resultingStock: number;
    notes?: string;
    createdAt: Date;
}
