import { Product } from './product.entity';
export declare class Promotion {
    id: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    appliesToAll: boolean;
    products: Product[];
    createdAt: Date;
    updatedAt: Date;
}
