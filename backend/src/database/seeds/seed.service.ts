import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  Role,
  RoleType,
  User,
  Category,
  Supplier,
  Product,
  Inventory,
  Customer,
  Promotion,
  RestockingAlert,
  AlertPriority,
} from '../entities';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Category) private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Supplier) private readonly supplierRepo: Repository<Supplier>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Inventory) private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Customer) private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Promotion) private readonly promotionRepo: Repository<Promotion>,
    @InjectRepository(RestockingAlert) private readonly alertRepo: Repository<RestockingAlert>,
  ) {}

  async onApplicationBootstrap() {
    try {
      await this.runSeed();
    } catch (error: any) {
      this.logger.warn(`Advertencia al ejecutar seed (posiblemente la BD aún no está disponible): ${error.message}`);
    }
  }

  async runSeed() {
    this.logger.log('Iniciando verificación y siembra de datos de prueba para SmartMarket...');

    // 1. Roles
    const rolesToCreate = [
      { name: RoleType.ADMIN, description: 'Administrador general del supermercado' },
      { name: RoleType.CAJERO, description: 'Cajero para punto de venta y checkout' },
      { name: RoleType.ABASTECIMIENTO, description: 'Responsable de inventario y reposición' },
    ];

    const rolesMap = new Map<RoleType, Role>();
    for (const r of rolesToCreate) {
      let role = await this.roleRepo.findOne({ where: { name: r.name } });
      if (!role) {
        role = await this.roleRepo.save(this.roleRepo.create(r));
        this.logger.log(`Rol creado: ${role.name}`);
      }
      rolesMap.set(r.name, role);
    }

    // 2. Usuarios base
    const saltRounds = 10;
    const usersToCreate = [
      {
        email: 'admin@smartmarket.com',
        password: 'Admin123!',
        fullName: 'Alejandro Botero (Admin)',
        roleId: rolesMap.get(RoleType.ADMIN)!.id,
      },
      {
        email: 'cajero@smartmarket.com',
        password: 'Cajero123!',
        fullName: 'Santiago Sánchez (Cajero)',
        roleId: rolesMap.get(RoleType.CAJERO)!.id,
      },
      {
        email: 'abastecimiento@smartmarket.com',
        password: 'Abasto123!',
        fullName: 'Responsable de Abastecimiento',
        roleId: rolesMap.get(RoleType.ABASTECIMIENTO)!.id,
      },
    ];

    for (const u of usersToCreate) {
      const existingUser = await this.userRepo.findOne({ where: { email: u.email } });
      if (!existingUser) {
        const passwordHash = await bcrypt.hash(u.password, saltRounds);
        await this.userRepo.save(
          this.userRepo.create({
            email: u.email,
            passwordHash,
            fullName: u.fullName,
            roleId: u.roleId,
          }),
        );
        this.logger.log(`Usuario creado: ${u.email}`);
      }
    }

    // 3. Categorías
    const categoriesData = [
      { name: 'Bebidas', description: 'Gaseosas, jugos, aguas y bebidas energéticas' },
      { name: 'Granos y Abarrotes', description: 'Arroz, aceites, pastas, harinas y legumbres' },
      { name: 'Lácteos', description: 'Leches, quesos, yogures y derivados' },
      { name: 'Limpieza y Hogar', description: 'Detergentes, desinfectantes y aseo' },
    ];

    const categoriesMap = new Map<string, Category>();
    for (const cat of categoriesData) {
      let category = await this.categoryRepo.findOne({ where: { name: cat.name } });
      if (!category) {
        category = await this.categoryRepo.save(this.categoryRepo.create(cat));
        this.logger.log(`Categoría creada: ${category.name}`);
      }
      categoriesMap.set(cat.name, category);
    }

    // 4. Proveedores
    const suppliersData = [
      {
        name: 'Distribuidora Central de Bebidas',
        document: 'NIT-900123456-1',
        phone: '3101234567',
        email: 'ventas@distribebidas.com',
        address: 'Zona Industrial Lote 4',
        deliveryLeadTimeDays: 2,
      },
      {
        name: 'Molinos y Granos del Valle',
        document: 'NIT-900789012-3',
        phone: '3157890123',
        email: 'contacto@molinosdelvalle.com',
        address: 'Autopista Sur Km 12',
        deliveryLeadTimeDays: 3,
      },
      {
        name: 'Industrias Lácteas Andinas',
        document: 'NIT-900456789-2',
        phone: '3204567890',
        email: 'pedidos@lacteosandinos.com',
        address: 'Vereda El Rosal',
        deliveryLeadTimeDays: 2,
      },
      {
        name: 'Oleaginosas y Grasas Premier',
        document: 'NIT-900333222-4',
        phone: '3183332221',
        email: 'suministros@oleopremier.com',
        address: 'Parque Industrial Norte Bodega 8',
        deliveryLeadTimeDays: 4,
      },
    ];

    const suppliersMap = new Map<string, Supplier>();
    for (const sup of suppliersData) {
      let supplier = await this.supplierRepo.findOne({ where: { document: sup.document } });
      if (!supplier) {
        supplier = await this.supplierRepo.save(this.supplierRepo.create(sup));
        this.logger.log(`Proveedor creado: ${supplier.name}`);
      }
      suppliersMap.set(sup.name, supplier);
    }

    // 5. Clientes
    const customersData = [
      {
        document: '1001',
        name: 'Carlos Restrepo',
        email: 'carlos.restrepo@email.com',
        phone: '3001112233',
        isFrequent: true, // CLIENTE FRECUENTE: RB-03 (+5% adicional, máx 20%)
      },
      {
        document: '1002',
        name: 'Laura Gómez',
        email: 'laura.gomez@email.com',
        phone: '3004445566',
        isFrequent: false, // CLIENTE REGULAR
      },
    ];

    for (const c of customersData) {
      const exists = await this.customerRepo.findOne({ where: { document: c.document } });
      if (!exists) {
        await this.customerRepo.save(this.customerRepo.create(c));
        this.logger.log(`Cliente registrado: ${c.name} (Frecuente: ${c.isFrequent})`);
      }
    }

    // 6. Promociones
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAhead = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const promotionsData = [
      {
        name: 'Promoción General por Volumen (Vigente)',
        description: 'Descuento escalonado según cantidad: 2 un (5%), 3-4 un (10%), >=5 un (15%).',
        startDate: oneWeekAgo,
        endDate: oneMonthAhead,
        isActive: true,
        appliesToAll: true,
      },
      {
        name: 'Promoción Temporada Pasada (Vencida)',
        description: 'Promoción expirada para verificación de RB-01 (no debe aplicarse).',
        startDate: twoMonthsAgo,
        endDate: twoWeeksAgo,
        isActive: true,
        appliesToAll: true,
      },
    ];

    for (const p of promotionsData) {
      const exists = await this.promotionRepo.findOne({ where: { name: p.name } });
      if (!exists) {
        await this.promotionRepo.save(this.promotionRepo.create(p));
        this.logger.log(`Promoción configurada: ${p.name}`);
      }
    }

    // 7. Productos e Inventario
    const productsData = [
      {
        sku: 'BEB-001',
        name: 'Coca-Cola 1.5L',
        description: 'Bebida gaseosa sabor original 1.5 litros',
        price: 6000,
        categoryName: 'Bebidas',
        supplierName: 'Distribuidora Central de Bebidas',
        minStockSafety: 5,
        avgDailySales: 8,
        initialStock: 2, // STOCK CRÍTICO: 2 unidades para probar concurrencia de cajas (RB-12)
      },
      {
        sku: 'ABR-001',
        name: 'Arroz Diana 1kg',
        description: 'Arroz blanco seleccionado 1 kilogramo',
        price: 4500,
        categoryName: 'Granos y Abarrotes',
        supplierName: 'Molinos y Granos del Valle',
        minStockSafety: 15,
        avgDailySales: 10, // Punto reposición = (10 * 3) + 15 = 45 unidades (RB-07)
        initialStock: 50,
      },
      {
        sku: 'ABR-002',
        name: 'Aceite Premier 1L',
        description: 'Aceite vegetal comestible 1 litro',
        price: 12000,
        categoryName: 'Granos y Abarrotes',
        supplierName: 'Oleaginosas y Grasas Premier',
        minStockSafety: 10,
        avgDailySales: 8, // Punto reposición = (8 * 4) + 10 = 42 unidades (RB-07)
        initialStock: 5, // 5 <= 42: GENERA ALERTA DE REPOSICIÓN INMEDIATA (RB-08)
      },
      {
        sku: 'LAC-001',
        name: 'Leche Entera Colanta 1L',
        description: 'Leche pasteurizada entera 1000 ml',
        price: 4200,
        categoryName: 'Lácteos',
        supplierName: 'Industrias Lácteas Andinas',
        minStockSafety: 10,
        avgDailySales: 6,
        initialStock: 30,
      },
      {
        sku: 'LIM-001',
        name: 'Detergente Ariel 1kg',
        description: 'Detergente en polvo para ropa',
        price: 15000,
        categoryName: 'Limpieza y Hogar',
        supplierName: 'Distribuidora Central de Bebidas',
        minStockSafety: 8,
        avgDailySales: 4,
        initialStock: 25,
      },
    ];

    for (const prodData of productsData) {
      let product = await this.productRepo.findOne({ where: { sku: prodData.sku } });
      const category = categoriesMap.get(prodData.categoryName)!;
      const supplier = suppliersMap.get(prodData.supplierName)!;

      if (!product) {
        product = await this.productRepo.save(
          this.productRepo.create({
            sku: prodData.sku,
            name: prodData.name,
            description: prodData.description,
            price: prodData.price,
            categoryId: category.id,
            supplierId: supplier.id,
            minStockSafety: prodData.minStockSafety,
            avgDailySales: prodData.avgDailySales,
          }),
        );
        this.logger.log(`Producto creado: ${product.name} (SKU: ${product.sku})`);
      }

      // Inventario
      let inventory = await this.inventoryRepo.findOne({ where: { productId: product.id } });
      if (!inventory) {
        inventory = await this.inventoryRepo.save(
          this.inventoryRepo.create({
            productId: product.id,
            currentStock: prodData.initialStock,
          }),
        );
        this.logger.log(`Inventario inicial para ${product.name}: ${inventory.currentStock} unidades`);
      }

      // Verificación de alerta de reposición (RB-07 y RB-08)
      const leadTime = supplier.deliveryLeadTimeDays;
      const reorderPoint = Math.round(Number(prodData.avgDailySales) * leadTime + prodData.minStockSafety);
      if (inventory.currentStock <= reorderPoint) {
        const existingAlert = await this.alertRepo.findOne({
          where: { productId: product.id, isResolved: false },
        });
        if (!existingAlert) {
          const priority =
            inventory.currentStock <= prodData.minStockSafety ? AlertPriority.ALTA : AlertPriority.MEDIA;
          await this.alertRepo.save(
            this.alertRepo.create({
              productId: product.id,
              currentStock: inventory.currentStock,
              reorderPoint,
              priority,
            }),
          );
          this.logger.log(
            `⚠️ Alerta generada para ${product.name}: Stock ${inventory.currentStock} <= Punto Reposición ${reorderPoint} (Prioridad: ${priority})`,
          );
        }
      }
    }

    this.logger.log('✅ Siembra de datos completada satisfactoriamente.');
  }
}
