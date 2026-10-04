import { Sale } from './sale.entity';
import { Product } from './product.entity';
export declare class SaleDetail {
    id: string;
    saleId: string;
    sale: Sale;
    productId: string;
    product: Product;
    quantity: number;
    unitPrice: number;
    discountPercentage: number;
    discountAmount: number;
    lineTotal: number;
}
