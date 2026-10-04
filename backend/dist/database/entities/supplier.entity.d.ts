import { Product } from './product.entity';
export declare class Supplier {
    id: string;
    name: string;
    document: string;
    phone: string;
    email: string;
    address: string;
    deliveryLeadTimeDays: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    products: Product[];
}
