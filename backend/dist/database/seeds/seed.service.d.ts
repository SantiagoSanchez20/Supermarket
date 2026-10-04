import { OnApplicationBootstrap } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role, User, Category, Supplier, Product, Inventory, Customer, Promotion, RestockingAlert } from '../entities';
export declare class SeedService implements OnApplicationBootstrap {
    private readonly roleRepo;
    private readonly userRepo;
    private readonly categoryRepo;
    private readonly supplierRepo;
    private readonly productRepo;
    private readonly inventoryRepo;
    private readonly customerRepo;
    private readonly promotionRepo;
    private readonly alertRepo;
    private readonly logger;
    constructor(roleRepo: Repository<Role>, userRepo: Repository<User>, categoryRepo: Repository<Category>, supplierRepo: Repository<Supplier>, productRepo: Repository<Product>, inventoryRepo: Repository<Inventory>, customerRepo: Repository<Customer>, promotionRepo: Repository<Promotion>, alertRepo: Repository<RestockingAlert>);
    onApplicationBootstrap(): Promise<void>;
    runSeed(): Promise<void>;
}
