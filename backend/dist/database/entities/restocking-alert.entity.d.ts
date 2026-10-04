import { Product } from './product.entity';
export declare enum AlertPriority {
    ALTA = "ALTA",
    MEDIA = "MEDIA",
    BAJA = "BAJA"
}
export declare class RestockingAlert {
    id: string;
    productId: string;
    product: Product;
    currentStock: number;
    reorderPoint: number;
    priority: AlertPriority;
    isResolved: boolean;
    createdAt: Date;
    resolvedAt?: Date;
}
