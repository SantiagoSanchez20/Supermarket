import { Repository, DataSource } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { Category } from '../database/entities/category.entity';
import { Supplier } from '../database/entities/supplier.entity';
import { Inventory } from '../database/entities/inventory.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsService {
    private readonly productRepo;
    private readonly categoryRepo;
    private readonly supplierRepo;
    private readonly inventoryRepo;
    private readonly dataSource;
    constructor(productRepo: Repository<Product>, categoryRepo: Repository<Category>, supplierRepo: Repository<Supplier>, inventoryRepo: Repository<Inventory>, dataSource: DataSource);
    create(createDto: CreateProductDto, userId?: string): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string;
        price: number;
        isActive: boolean;
        category: Category;
        supplier: Supplier;
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
    findAll(queryDto?: ProductQueryDto): Promise<{
        id: string;
        sku: string;
        name: string;
        description: string;
        price: number;
        isActive: boolean;
        category: Category;
        supplier: Supplier;
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
        category: Category;
        supplier: Supplier;
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
        category: Category;
        supplier: Supplier;
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
        category: Category;
        supplier: Supplier;
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
    private mapProductWithMetrics;
}
