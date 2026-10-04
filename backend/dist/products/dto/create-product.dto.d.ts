export declare class CreateProductDto {
    sku: string;
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    supplierId: string;
    minStockSafety?: number;
    avgDailySales?: number;
    initialStock?: number;
}
