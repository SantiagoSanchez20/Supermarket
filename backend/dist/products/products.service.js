"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../database/entities/product.entity");
const category_entity_1 = require("../database/entities/category.entity");
const supplier_entity_1 = require("../database/entities/supplier.entity");
const inventory_entity_1 = require("../database/entities/inventory.entity");
const inventory_movement_entity_1 = require("../database/entities/inventory-movement.entity");
let ProductsService = class ProductsService {
    productRepo;
    categoryRepo;
    supplierRepo;
    inventoryRepo;
    dataSource;
    constructor(productRepo, categoryRepo, supplierRepo, inventoryRepo, dataSource) {
        this.productRepo = productRepo;
        this.categoryRepo = categoryRepo;
        this.supplierRepo = supplierRepo;
        this.inventoryRepo = inventoryRepo;
        this.dataSource = dataSource;
    }
    async create(createDto, userId) {
        const existingSku = await this.productRepo.findOne({
            where: { sku: createDto.sku },
        });
        if (existingSku) {
            throw new common_1.ConflictException(`Ya existe un producto con el SKU "${createDto.sku}".`);
        }
        const category = await this.categoryRepo.findOne({
            where: { id: createDto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException('La categoría especificada no existe.');
        }
        const supplier = await this.supplierRepo.findOne({
            where: { id: createDto.supplierId },
        });
        if (!supplier) {
            throw new common_1.NotFoundException('El proveedor especificado no existe.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = queryRunner.manager.create(product_entity_1.Product, {
                sku: createDto.sku.trim().toUpperCase(),
                name: createDto.name.trim(),
                description: createDto.description?.trim(),
                price: createDto.price,
                categoryId: category.id,
                supplierId: supplier.id,
                minStockSafety: createDto.minStockSafety ?? 10,
                avgDailySales: createDto.avgDailySales ?? 5.0,
            });
            const savedProduct = await queryRunner.manager.save(product);
            const initialStock = createDto.initialStock ?? 0;
            const inventory = queryRunner.manager.create(inventory_entity_1.Inventory, {
                productId: savedProduct.id,
                currentStock: initialStock,
            });
            await queryRunner.manager.save(inventory);
            if (initialStock > 0) {
                const movement = queryRunner.manager.create(inventory_movement_entity_1.InventoryMovement, {
                    productId: savedProduct.id,
                    userId: userId || undefined,
                    movementType: inventory_movement_entity_1.MovementType.ENTRADA,
                    quantity: initialStock,
                    previousStock: 0,
                    resultingStock: initialStock,
                    notes: 'Inventario inicial al crear producto',
                });
                await queryRunner.manager.save(movement);
            }
            await queryRunner.commitTransaction();
            return this.findOne(savedProduct.id);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(queryDto) {
        const where = {};
        if (queryDto?.categoryId) {
            where.categoryId = queryDto.categoryId;
        }
        if (queryDto?.isActive !== undefined) {
            where.isActive = queryDto.isActive === 'true';
        }
        let products = await this.productRepo.find({
            where,
            relations: {
                category: true,
                supplier: true,
                inventory: true,
            },
            order: { name: 'ASC' },
        });
        if (queryDto?.search) {
            const term = queryDto.search.toLowerCase();
            products = products.filter((p) => p.name.toLowerCase().includes(term) ||
                p.sku.toLowerCase().includes(term) ||
                p.description?.toLowerCase().includes(term));
        }
        return products.map((product) => this.mapProductWithMetrics(product));
    }
    async findOne(id) {
        const product = await this.productRepo.findOne({
            where: { id },
            relations: {
                category: true,
                supplier: true,
                inventory: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado.`);
        }
        return this.mapProductWithMetrics(product);
    }
    async findBySku(sku) {
        const product = await this.productRepo.findOne({
            where: { sku: sku.trim().toUpperCase() },
            relations: {
                category: true,
                supplier: true,
                inventory: true,
            },
        });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con SKU "${sku}" no encontrado.`);
        }
        return this.mapProductWithMetrics(product);
    }
    async update(id, updateDto) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado.`);
        }
        if (updateDto.sku && updateDto.sku !== product.sku) {
            const exists = await this.productRepo.findOne({
                where: { sku: updateDto.sku },
            });
            if (exists) {
                throw new common_1.ConflictException(`Ya existe otro producto con el SKU "${updateDto.sku}".`);
            }
            product.sku = updateDto.sku.trim().toUpperCase();
        }
        if (updateDto.categoryId) {
            const cat = await this.categoryRepo.findOne({ where: { id: updateDto.categoryId } });
            if (!cat)
                throw new common_1.NotFoundException('Categoría no encontrada.');
            product.categoryId = cat.id;
        }
        if (updateDto.supplierId) {
            const sup = await this.supplierRepo.findOne({ where: { id: updateDto.supplierId } });
            if (!sup)
                throw new common_1.NotFoundException('Proveedor no encontrado.');
            product.supplierId = sup.id;
        }
        if (updateDto.name !== undefined)
            product.name = updateDto.name.trim();
        if (updateDto.description !== undefined)
            product.description = updateDto.description?.trim();
        if (updateDto.price !== undefined) {
            if (updateDto.price <= 0)
                throw new common_1.BadRequestException('El precio debe ser mayor a cero.');
            product.price = updateDto.price;
        }
        if (updateDto.minStockSafety !== undefined)
            product.minStockSafety = updateDto.minStockSafety;
        if (updateDto.avgDailySales !== undefined)
            product.avgDailySales = updateDto.avgDailySales;
        if (updateDto.isActive !== undefined)
            product.isActive = updateDto.isActive;
        await this.productRepo.save(product);
        return this.findOne(id);
    }
    async toggleActive(id) {
        const product = await this.productRepo.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException(`Producto con ID ${id} no encontrado.`);
        }
        product.isActive = !product.isActive;
        await this.productRepo.save(product);
        return {
            id: product.id,
            name: product.name,
            isActive: product.isActive,
            message: `Producto ${product.isActive ? 'activado' : 'desactivado'} exitosamente.`,
        };
    }
    mapProductWithMetrics(product) {
        const currentStock = product.inventory?.currentStock ?? 0;
        const leadTime = product.supplier?.deliveryLeadTimeDays ?? 3;
        const avgDailySales = Number(product.avgDailySales);
        const minStockSafety = product.minStockSafety;
        const reorderPoint = Math.round(avgDailySales * leadTime + minStockSafety);
        const needsRestock = currentStock <= reorderPoint;
        return {
            id: product.id,
            sku: product.sku,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            isActive: product.isActive,
            category: product.category,
            supplier: product.supplier,
            stock: {
                currentStock,
                minStockSafety,
                avgDailySales,
                deliveryLeadTimeDays: leadTime,
                reorderPoint,
                needsRestock,
            },
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __param(2, (0, typeorm_1.InjectRepository)(supplier_entity_1.Supplier)),
    __param(3, (0, typeorm_1.InjectRepository)(inventory_entity_1.Inventory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], ProductsService);
//# sourceMappingURL=products.service.js.map