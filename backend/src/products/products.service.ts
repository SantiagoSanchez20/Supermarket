import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Product } from '../database/entities/product.entity';
import { Category } from '../database/entities/category.entity';
import { Supplier } from '../database/entities/supplier.entity';
import { Inventory } from '../database/entities/inventory.entity';
import { InventoryMovement, MovementType } from '../database/entities/inventory-movement.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Supplier)
    private readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createDto: CreateProductDto, userId?: string) {
    const existingSku = await this.productRepo.findOne({
      where: { sku: createDto.sku },
    });
    if (existingSku) {
      throw new ConflictException(`Ya existe un producto con el SKU "${createDto.sku}".`);
    }

    const category = await this.categoryRepo.findOne({
      where: { id: createDto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('La categoría especificada no existe.');
    }

    const supplier = await this.supplierRepo.findOne({
      where: { id: createDto.supplierId },
    });
    if (!supplier) {
      throw new NotFoundException('El proveedor especificado no existe.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const product = queryRunner.manager.create(Product, {
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
      const inventory = queryRunner.manager.create(Inventory, {
        productId: savedProduct.id,
        currentStock: initialStock,
      });
      await queryRunner.manager.save(inventory);

      if (initialStock > 0) {
        const movement = queryRunner.manager.create(InventoryMovement, {
          productId: savedProduct.id,
          userId: userId || undefined,
          movementType: MovementType.ENTRADA,
          quantity: initialStock,
          previousStock: 0,
          resultingStock: initialStock,
          notes: 'Inventario inicial al crear producto',
        });
        await queryRunner.manager.save(movement);
      }

      await queryRunner.commitTransaction();

      return this.findOne(savedProduct.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(queryDto?: ProductQueryDto) {
    const where: any = {};

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
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.sku.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term),
      );
    }

    return products.map((product) => this.mapProductWithMetrics(product));
  }

  async findOne(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    return this.mapProductWithMetrics(product);
  }

  async findBySku(sku: string) {
    const product = await this.productRepo.findOne({
      where: { sku: sku.trim().toUpperCase() },
      relations: {
        category: true,
        supplier: true,
        inventory: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Producto con SKU "${sku}" no encontrado.`);
    }

    return this.mapProductWithMetrics(product);
  }

  async update(id: string, updateDto: UpdateProductDto) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
    }

    if (updateDto.sku && updateDto.sku !== product.sku) {
      const exists = await this.productRepo.findOne({
        where: { sku: updateDto.sku },
      });
      if (exists) {
        throw new ConflictException(`Ya existe otro producto con el SKU "${updateDto.sku}".`);
      }
      product.sku = updateDto.sku.trim().toUpperCase();
    }

    if (updateDto.categoryId) {
      const cat = await this.categoryRepo.findOne({ where: { id: updateDto.categoryId } });
      if (!cat) throw new NotFoundException('Categoría no encontrada.');
      product.categoryId = cat.id;
    }

    if (updateDto.supplierId) {
      const sup = await this.supplierRepo.findOne({ where: { id: updateDto.supplierId } });
      if (!sup) throw new NotFoundException('Proveedor no encontrado.');
      product.supplierId = sup.id;
    }

    if (updateDto.name !== undefined) product.name = updateDto.name.trim();
    if (updateDto.description !== undefined) product.description = updateDto.description?.trim();
    if (updateDto.price !== undefined) {
      if (updateDto.price <= 0) throw new BadRequestException('El precio debe ser mayor a cero.');
      product.price = updateDto.price;
    }
    if (updateDto.minStockSafety !== undefined) product.minStockSafety = updateDto.minStockSafety;
    if (updateDto.avgDailySales !== undefined) product.avgDailySales = updateDto.avgDailySales;
    if (updateDto.isActive !== undefined) product.isActive = updateDto.isActive;

    await this.productRepo.save(product);
    return this.findOne(id);
  }

  async toggleActive(id: string) {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
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

  /**
   * Enriquecimiento con métricas de reposición (RB-07 y RB-08)
   */
  private mapProductWithMetrics(product: Product) {
    const currentStock = product.inventory?.currentStock ?? 0;
    const leadTime = product.supplier?.deliveryLeadTimeDays ?? 3;
    const avgDailySales = Number(product.avgDailySales);
    const minStockSafety = product.minStockSafety;

    // RB-07: Punto de reposición = (ventas promedio diarias × tiempo de entrega) + stock de seguridad
    const reorderPoint = Math.round(avgDailySales * leadTime + minStockSafety);

    // RB-08: Si stock actual <= punto de reposición, necesita abastecimiento
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
}
