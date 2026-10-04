import { Product } from './product.entity';
export declare class Inventory {
    id: string;
    productId: string;
    product: Product;
    currentStock: number;
    updatedAt: Date;
}
