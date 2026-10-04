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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const inventory_entity_1 = require("../database/entities/inventory.entity");
const product_entity_1 = require("../database/entities/product.entity");
const inventory_movement_entity_1 = require("../database/entities/inventory-movement.entity");
const restocking_alert_entity_1 = require("../database/entities/restocking-alert.entity");
let InventoryService = class InventoryService {
    inventoryRepo;
    productRepo;
    movementRepo;
    alertRepo;
    dataSource;
    constructor(inventoryRepo, productRepo, movementRepo, alertRepo, dataSource) {
        this.inventoryRepo = inventoryRepo;
        this.productRepo = productRepo;
        this.movementRepo = movementRepo;
        this.alertRepo = alertRepo;
        this.dataSource = dataSource;
    }
    async getAll() {
        const inventories = await this.inventoryRepo.find({
            relations: {
                product: {
                    category: true,
                    supplier: true,
                },
            },
        });
        return inventories.map((inv) => this.mapInventoryWithStatus(inv));
    }
    async getByProductId(productId) {
        const inventory = await this.inventoryRepo.findOne({
            where: { productId },
            relations: {
                product: {
                    category: true,
                    supplier: true,
                },
            },
        });
        if (!inventory) {
            throw new common_1.NotFoundException(`No se encontró registro de inventario para el producto ${productId}.`);
        }
        return this.mapInventoryWithStatus(inventory);
    }
    async registerStockEntry(dto, userId) {
        if (dto.quantity <= 0) {
            throw new common_1.BadRequestException('La cantidad a ingresar debe ser mayor a cero.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                where: { id: dto.productId },
                relations: { supplier: true },
            });
            if (!product) {
                throw new common_1.NotFoundException('El producto especificado no existe.');
            }
            let inventory = await queryRunner.manager.findOne(inventory_entity_1.Inventory, {
                where: { productId: dto.productId },
            });
            if (!inventory) {
                inventory = queryRunner.manager.create(inventory_entity_1.Inventory, {
                    productId: dto.productId,
                    currentStock: 0,
                });
            }
            const previousStock = inventory.currentStock;
            const resultingStock = previousStock + dto.quantity;
            inventory.currentStock = resultingStock;
            await queryRunner.manager.save(inventory);
            const movement = queryRunner.manager.create(inventory_movement_entity_1.InventoryMovement, {
                productId: dto.productId,
                userId: userId || undefined,
                movementType: inventory_movement_entity_1.MovementType.ENTRADA,
                quantity: dto.quantity,
                previousStock,
                resultingStock,
                notes: dto.notes ?? 'Entrada de mercancía / Reposición',
            });
            await queryRunner.manager.save(movement);
            const leadTime = product.supplier?.deliveryLeadTimeDays ?? 3;
            const reorderPoint = Math.round(Number(product.avgDailySales) * leadTime + product.minStockSafety);
            if (resultingStock > reorderPoint) {
                const activeAlert = await queryRunner.manager.findOne(restocking_alert_entity_1.RestockingAlert, {
                    where: { productId: dto.productId, isResolved: false },
                });
                if (activeAlert) {
                    activeAlert.isResolved = true;
                    activeAlert.resolvedAt = new Date();
                    await queryRunner.manager.save(activeAlert);
                }
            }
            await queryRunner.commitTransaction();
            return this.getByProductId(dto.productId);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async adjustStock(dto, userId) {
        if (dto.newStock < 0) {
            throw new common_1.BadRequestException('El inventario de un producto nunca puede quedar con una cantidad menor a cero.');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOne(product_entity_1.Product, {
                where: { id: dto.productId },
                relations: { supplier: true },
            });
            if (!product) {
                throw new common_1.NotFoundException('El producto especificado no existe.');
            }
            const inventory = await queryRunner.manager.findOne(inventory_entity_1.Inventory, {
                where: { productId: dto.productId },
            });
            if (!inventory) {
                throw new common_1.NotFoundException('No existe registro de inventario para este producto.');
            }
            const previousStock = inventory.currentStock;
            const resultingStock = dto.newStock;
            const difference = resultingStock - previousStock;
            inventory.currentStock = resultingStock;
            await queryRunner.manager.save(inventory);
            const movement = queryRunner.manager.create(inventory_movement_entity_1.InventoryMovement, {
                productId: dto.productId,
                userId: userId || undefined,
                movementType: inventory_movement_entity_1.MovementType.AJUSTE,
                quantity: Math.abs(difference),
                previousStock,
                resultingStock,
                notes: `Ajuste manual: ${dto.reason} (Diferencia: ${difference >= 0 ? '+' : ''}${difference})`,
            });
            await queryRunner.manager.save(movement);
            const leadTime = product.supplier?.deliveryLeadTimeDays ?? 3;
            const reorderPoint = Math.round(Number(product.avgDailySales) * leadTime + product.minStockSafety);
            if (resultingStock <= reorderPoint) {
                const existingAlert = await queryRunner.manager.findOne(restocking_alert_entity_1.RestockingAlert, {
                    where: { productId: dto.productId, isResolved: false },
                });
                const priority = resultingStock <= product.minStockSafety ? restocking_alert_entity_1.AlertPriority.ALTA : restocking_alert_entity_1.AlertPriority.MEDIA;
                if (existingAlert) {
                    existingAlert.currentStock = resultingStock;
                    existingAlert.priority = priority;
                    await queryRunner.manager.save(existingAlert);
                }
                else {
                    const newAlert = queryRunner.manager.create(restocking_alert_entity_1.RestockingAlert, {
                        productId: dto.productId,
                        currentStock: resultingStock,
                        reorderPoint,
                        priority,
                    });
                    await queryRunner.manager.save(newAlert);
                }
            }
            else {
                const existingAlert = await queryRunner.manager.findOne(restocking_alert_entity_1.RestockingAlert, {
                    where: { productId: dto.productId, isResolved: false },
                });
                if (existingAlert) {
                    existingAlert.isResolved = true;
                    existingAlert.resolvedAt = new Date();
                    await queryRunner.manager.save(existingAlert);
                }
            }
            await queryRunner.commitTransaction();
            return this.getByProductId(dto.productId);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async deductStockTransactional(manager, productId, quantity, saleId, userId) {
        if (quantity <= 0) {
            throw new common_1.BadRequestException('La cantidad a vender debe ser mayor a cero.');
        }
        const inventory = await manager
            .createQueryBuilder(inventory_entity_1.Inventory, 'inv')
            .setLock('pessimistic_write')
            .where('inv.productId = :productId', { productId })
            .getOne();
        if (!inventory) {
            throw new common_1.NotFoundException(`Inventario del producto ${productId} no encontrado.`);
        }
        if (inventory.currentStock < quantity) {
            throw new common_1.BadRequestException('No hay suficiente inventario para completar la venta.');
        }
        const previousStock = inventory.currentStock;
        const resultingStock = previousStock - quantity;
        if (resultingStock < 0) {
            throw new common_1.BadRequestException('El inventario de un producto nunca puede quedar con una cantidad menor a cero.');
        }
        inventory.currentStock = resultingStock;
        await manager.save(inventory);
        const movement = manager.create(inventory_movement_entity_1.InventoryMovement, {
            productId,
            saleId,
            userId,
            movementType: inventory_movement_entity_1.MovementType.VENTA,
            quantity,
            previousStock,
            resultingStock,
            notes: `Venta procesada`,
        });
        await manager.save(movement);
        const product = await manager.findOne(product_entity_1.Product, {
            where: { id: productId },
            relations: { supplier: true },
        });
        if (product) {
            const leadTime = product.supplier?.deliveryLeadTimeDays ?? 3;
            const reorderPoint = Math.round(Number(product.avgDailySales) * leadTime + product.minStockSafety);
            if (resultingStock <= reorderPoint) {
                const existingAlert = await manager.findOne(restocking_alert_entity_1.RestockingAlert, {
                    where: { productId, isResolved: false },
                });
                const priority = resultingStock <= product.minStockSafety ? restocking_alert_entity_1.AlertPriority.ALTA : restocking_alert_entity_1.AlertPriority.MEDIA;
                if (existingAlert) {
                    existingAlert.currentStock = resultingStock;
                    existingAlert.priority = priority;
                    await manager.save(existingAlert);
                }
                else {
                    const newAlert = manager.create(restocking_alert_entity_1.RestockingAlert, {
                        productId,
                        currentStock: resultingStock,
                        reorderPoint,
                        priority,
                    });
                    await manager.save(newAlert);
                }
            }
        }
        return { previousStock, resultingStock };
    }
    async getMovements(productId, limit = 50, offset = 0) {
        const qb = this.movementRepo
            .createQueryBuilder('mov')
            .leftJoinAndSelect('mov.product', 'product')
            .leftJoinAndSelect('mov.user', 'user')
            .leftJoinAndSelect('mov.sale', 'sale')
            .orderBy('mov.createdAt', 'DESC')
            .take(limit)
            .skip(offset);
        if (productId) {
            qb.where('mov.productId = :productId', { productId });
        }
        const [items, total] = await qb.getManyAndCount();
        return {
            total,
            limit,
            offset,
            items: items.map((m) => ({
                id: m.id,
                productId: m.productId,
                productName: m.product?.name,
                sku: m.product?.sku,
                movementType: m.movementType,
                quantity: m.quantity,
                previousStock: m.previousStock,
                resultingStock: m.resultingStock,
                saleId: m.saleId,
                userName: m.user?.fullName,
                notes: m.notes,
                createdAt: m.createdAt,
            })),
        };
    }
    mapInventoryWithStatus(inv) {
        const product = inv.product;
        const currentStock = inv.currentStock;
        const leadTime = product?.supplier?.deliveryLeadTimeDays ?? 3;
        const avgDailySales = Number(product?.avgDailySales ?? 0);
        const minStockSafety = product?.minStockSafety ?? 0;
        const reorderPoint = Math.round(avgDailySales * leadTime + minStockSafety);
        const needsRestock = currentStock <= reorderPoint;
        const isCritical = currentStock <= minStockSafety;
        return {
            id: inv.id,
            productId: inv.productId,
            productName: product?.name,
            sku: product?.sku,
            categoryName: product?.category?.name,
            supplierName: product?.supplier?.name,
            currentStock,
            minStockSafety,
            avgDailySales,
            deliveryLeadTimeDays: leadTime,
            reorderPoint,
            needsRestock,
            isCritical,
            updatedAt: inv.updatedAt,
        };
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(inventory_entity_1.Inventory)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(inventory_movement_entity_1.InventoryMovement)),
    __param(3, (0, typeorm_1.InjectRepository)(restocking_alert_entity_1.RestockingAlert)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map