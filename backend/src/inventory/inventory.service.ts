import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { Inventory } from '../database/entities/inventory.entity';
import { Product } from '../database/entities/product.entity';
import { InventoryMovement, MovementType } from '../database/entities/inventory-movement.entity';
import { RestockingAlert, AlertPriority } from '../database/entities/restocking-alert.entity';
import { StockEntryDto } from './dto/stock-entry.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(InventoryMovement)
    private readonly movementRepo: Repository<InventoryMovement>,
    @InjectRepository(RestockingAlert)
    private readonly alertRepo: Repository<RestockingAlert>,
    private readonly dataSource: DataSource,
  ) {}

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

  async getByProductId(productId: string) {
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
      throw new NotFoundException(`No se encontró registro de inventario para el producto ${productId}.`);
    }

    return this.mapInventoryWithStatus(inventory);
  }

  /**
   * Registrar una entrada de existencias (abastecimiento o reposición de mercancía).
   */
  async registerStockEntry(dto: StockEntryDto, userId?: string) {
    if (dto.quantity <= 0) {
      throw new BadRequestException('La cantidad a ingresar debe ser mayor a cero.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId },
        relations: { supplier: true },
      });
      if (!product) {
        throw new NotFoundException('El producto especificado no existe.');
      }

      let inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId: dto.productId },
      });

      if (!inventory) {
        inventory = queryRunner.manager.create(Inventory, {
          productId: dto.productId,
          currentStock: 0,
        });
      }

      const previousStock = inventory.currentStock;
      const resultingStock = previousStock + dto.quantity;
      inventory.currentStock = resultingStock;

      await queryRunner.manager.save(inventory);

      // Registrar movimiento en el kardex (RB-05)
      const movement = queryRunner.manager.create(InventoryMovement, {
        productId: dto.productId,
        userId: userId || undefined,
        movementType: MovementType.ENTRADA,
        quantity: dto.quantity,
        previousStock,
        resultingStock,
        notes: dto.notes ?? 'Entrada de mercancía / Reposición',
      });
      await queryRunner.manager.save(movement);

      // Verificar y resolver alertas si el stock superó el punto de reposición
      const leadTime = product.supplier?.deliveryLeadTimeDays ?? 3;
      const reorderPoint = Math.round(Number(product.avgDailySales) * leadTime + product.minStockSafety);
      if (resultingStock > reorderPoint) {
        const activeAlert = await queryRunner.manager.findOne(RestockingAlert, {
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Realizar ajuste manual de inventario (auditoría / conteo físico).
   * Valida estrictamente RB-06: newStock >= 0.
   */
  async adjustStock(dto: StockAdjustmentDto, userId?: string) {
    if (dto.newStock < 0) {
      throw new BadRequestException('El inventario de un producto nunca puede quedar con una cantidad menor a cero.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = await queryRunner.manager.findOne(Product, {
        where: { id: dto.productId },
        relations: { supplier: true },
      });
      if (!product) {
        throw new NotFoundException('El producto especificado no existe.');
      }

      const inventory = await queryRunner.manager.findOne(Inventory, {
        where: { productId: dto.productId },
      });
      if (!inventory) {
        throw new NotFoundException('No existe registro de inventario para este producto.');
      }

      const previousStock = inventory.currentStock;
      const resultingStock = dto.newStock;
      const difference = resultingStock - previousStock;

      inventory.currentStock = resultingStock;
      await queryRunner.manager.save(inventory);

      // Registrar movimiento de ajuste en el kardex
      const movement = queryRunner.manager.create(InventoryMovement, {
        productId: dto.productId,
        userId: userId || undefined,
        movementType: MovementType.AJUSTE,
        quantity: Math.abs(difference),
        previousStock,
        resultingStock,
        notes: `Ajuste manual: ${dto.reason} (Diferencia: ${difference >= 0 ? '+' : ''}${difference})`,
      });
      await queryRunner.manager.save(movement);

      // Actualizar alertas de reposición según el nuevo stock
      const leadTime = product.supplier?.deliveryLeadTimeDays ?? 3;
      const reorderPoint = Math.round(Number(product.avgDailySales) * leadTime + product.minStockSafety);

      if (resultingStock <= reorderPoint) {
        const existingAlert = await queryRunner.manager.findOne(RestockingAlert, {
          where: { productId: dto.productId, isResolved: false },
        });
        const priority =
          resultingStock <= product.minStockSafety ? AlertPriority.ALTA : AlertPriority.MEDIA;

        if (existingAlert) {
          existingAlert.currentStock = resultingStock;
          existingAlert.priority = priority;
          await queryRunner.manager.save(existingAlert);
        } else {
          const newAlert = queryRunner.manager.create(RestockingAlert, {
            productId: dto.productId,
            currentStock: resultingStock,
            reorderPoint,
            priority,
          });
          await queryRunner.manager.save(newAlert);
        }
      } else {
        // Si el ajuste dejó el stock por encima del punto, resolver alerta si existía
        const existingAlert = await queryRunner.manager.findOne(RestockingAlert, {
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
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Método transaccional para descontar inventario durante una venta (RB-04, RB-05, RB-06, RB-12).
   */
  async deductStockTransactional(
    manager: EntityManager,
    productId: string,
    quantity: number,
    saleId: string,
    userId: string,
  ) {
    if (quantity <= 0) {
      throw new BadRequestException('La cantidad a vender debe ser mayor a cero.');
    }

    // Bloqueo del registro de inventario (en Postgres con FOR UPDATE)
    const inventory = await manager
      .createQueryBuilder(Inventory, 'inv')
      .setLock('pessimistic_write')
      .where('inv.productId = :productId', { productId })
      .getOne();

    if (!inventory) {
      throw new NotFoundException(`Inventario del producto ${productId} no encontrado.`);
    }

    // RB-04: No permitir ventas superiores al inventario disponible
    if (inventory.currentStock < quantity) {
      throw new BadRequestException('No hay suficiente inventario para completar la venta.');
    }

    const previousStock = inventory.currentStock;
    const resultingStock = previousStock - quantity;

    // RB-06: El inventario nunca puede quedar por debajo de cero
    if (resultingStock < 0) {
      throw new BadRequestException('El inventario de un producto nunca puede quedar con una cantidad menor a cero.');
    }

    inventory.currentStock = resultingStock;
    await manager.save(inventory);

    // RB-05: Auditoría atómica de salida en el kardex
    const movement = manager.create(InventoryMovement, {
      productId,
      saleId,
      userId,
      movementType: MovementType.VENTA,
      quantity,
      previousStock,
      resultingStock,
      notes: `Venta procesada`,
    });
    await manager.save(movement);

    // Evaluación de alerta de reposición (RB-08)
    const product = await manager.findOne(Product, {
      where: { id: productId },
      relations: { supplier: true },
    });
    if (product) {
      const leadTime = product.supplier?.deliveryLeadTimeDays ?? 3;
      const reorderPoint = Math.round(Number(product.avgDailySales) * leadTime + product.minStockSafety);

      if (resultingStock <= reorderPoint) {
        const existingAlert = await manager.findOne(RestockingAlert, {
          where: { productId, isResolved: false },
        });
        const priority =
          resultingStock <= product.minStockSafety ? AlertPriority.ALTA : AlertPriority.MEDIA;

        if (existingAlert) {
          existingAlert.currentStock = resultingStock;
          existingAlert.priority = priority;
          await manager.save(existingAlert);
        } else {
          const newAlert = manager.create(RestockingAlert, {
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

  /**
   * Consultar historial de movimientos (Kardex).
   */
  async getMovements(productId?: string, limit = 50, offset = 0) {
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

  private mapInventoryWithStatus(inv: Inventory) {
    const product = inv.product;
    const currentStock = inv.currentStock;
    const leadTime = product?.supplier?.deliveryLeadTimeDays ?? 3;
    const avgDailySales = Number(product?.avgDailySales ?? 0);
    const minStockSafety = product?.minStockSafety ?? 0;

    // RB-07: Fórmula del Punto de Reposición
    const reorderPoint = Math.round(avgDailySales * leadTime + minStockSafety);

    // RB-08: Condición de Alerta de Abastecimiento
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
}
