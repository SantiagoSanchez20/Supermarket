import { Sale } from './sale.entity';
export declare class Customer {
    id: string;
    document: string;
    name: string;
    email: string;
    phone: string;
    isFrequent: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    sales: Sale[];
}
