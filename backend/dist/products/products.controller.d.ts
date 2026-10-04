import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createDto: CreateProductDto, userId: string): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string;
        price: number;
        isActive: boolean;
        category: import("../database/entities").Category;
        supplier: import("../database/entities").Supplier;
        stock: {
            currentStock: number;
            minStockSafety: number;
            avgDailySales: number;
            deliveryLeadTimeDays: number;
            reorderPoint: number;
            needsRestock: boolean;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(queryDto: ProductQueryDto): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string;
        price: number;
        isActive: boolean;
        category: import("../database/entities").Category;
        supplier: import("../database/entities").Supplier;
        stock: {
            currentStock: number;
            minStockSafety: number;
            avgDailySales: number;
            deliveryLeadTimeDays: number;
            reorderPoint: number;
            needsRestock: boolean;
        };
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string;
        price: number;
        isActive: boolean;
        category: import("../database/entities").Category;
        supplier: import("../database/entities").Supplier;
        stock: {
            currentStock: number;
            minStockSafety: number;
            avgDailySales: number;
            deliveryLeadTimeDays: number;
            reorderPoint: number;
            needsRestock: boolean;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    findBySku(sku: string): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string;
        price: number;
        isActive: boolean;
        category: import("../database/entities").Category;
        supplier: import("../database/entities").Supplier;
        stock: {
            currentStock: number;
            minStockSafety: number;
            avgDailySales: number;
            deliveryLeadTimeDays: number;
            reorderPoint: number;
            needsRestock: boolean;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, updateDto: UpdateProductDto): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string;
        price: number;
        isActive: boolean;
        category: import("../database/entities").Category;
        supplier: import("../database/entities").Supplier;
        stock: {
            currentStock: number;
            minStockSafety: number;
            avgDailySales: number;
            deliveryLeadTimeDays: number;
            reorderPoint: number;
            needsRestock: boolean;
        };
        createdAt: Date;
        updatedAt: Date;
    }>;
    toggleActive(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        message: string;
    }>;
}
