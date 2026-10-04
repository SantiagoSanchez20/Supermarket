"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SeedService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const entities_1 = require("../entities");
let SeedService = SeedService_1 = class SeedService {
    roleRepo;
    userRepo;
    categoryRepo;
    supplierRepo;
    productRepo;
    inventoryRepo;
    customerRepo;
    promotionRepo;
    alertRepo;
    logger = new common_1.Logger(SeedService_1.name);
    constructor(roleRepo, userRepo, categoryRepo, supplierRepo, productRepo, inventoryRepo, customerRepo, promotionRepo, alertRepo) {
        this.roleRepo = roleRepo;
        this.userRepo = userRepo;
        this.categoryRepo = categoryRepo;
        this.supplierRepo = supplierRepo;
        this.productRepo = productRepo;
        this.inventoryRepo = inventoryRepo;
        this.customerRepo = customerRepo;
        this.promotionRepo = promotionRepo;
        this.alertRepo = alertRepo;
    }
    async onApplicationBootstrap() {
        try {
            await this.runSeed();
        }
        catch (error) {
            this.logger.warn(`Advertencia al ejecutar seed (posiblemente la BD aún no está disponible): ${error.message}`);
        }
    }
    async runSeed() {
        this.logger.log('Iniciando verificación y siembra de datos de prueba para SmartMarket...');
        const rolesToCreate = [
            { name: entities_1.RoleType.ADMIN, description: 'Administrador general del supermercado' },
            { name: entities_1.RoleType.CAJERO, description: 'Cajero para punto de venta y checkout' },
            { name: entities_1.RoleType.ABASTECIMIENTO, description: 'Responsable de inventario y reposición' },
        ];
        const rolesMap = new Map();
        for (const r of rolesToCreate) {
            let role = await this.roleRepo.findOne({ where: { name: r.name } });
            if (!role) {
                role = await this.roleRepo.save(this.roleRepo.create(r));
                this.logger.log(`Rol creado: ${role.name}`);
            }
            rolesMap.set(r.name, role);
        }
        const saltRounds = 10;
        const usersToCreate = [
            {
                email: 'admin@smartmarket.com',
                password: 'Admin123!',
                fullName: 'Alejandro Botero (Admin)',
                roleId: rolesMap.get(entities_1.RoleType.ADMIN).id,
            },
            {
                email: 'cajero@smartmarket.com',
                password: 'Cajero123!',
                fullName: 'Santiago Sánchez (Cajero)',
                roleId: rolesMap.get(entities_1.RoleType.CAJERO).id,
            },
            {
                email: 'abastecimiento@smartmarket.com',
                password: 'Abasto123!',
                fullName: 'Responsable de Abastecimiento',
                roleId: rolesMap.get(entities_1.RoleType.ABASTECIMIENTO).id,
            },
        ];
        for (const u of usersToCreate) {
            const existingUser = await this.userRepo.findOne({ where: { email: u.email } });
            if (!existingUser) {
                const passwordHash = await bcrypt.hash(u.password, saltRounds);
                await this.userRepo.save(this.userRepo.create({
                    email: u.email,
                    passwordHash,
                    fullName: u.fullName,
                    roleId: u.roleId,
                }));
                this.logger.log(`Usuario creado: ${u.email}`);
            }
        }
        const categoriesData = [
            { name: 'Bebidas', description: 'Gaseosas, jugos, aguas y bebidas energéticas' },
            { name: 'Granos y Abarrotes', description: 'Arroz, aceites, pastas, harinas y legumbres' },
            { name: 'Lácteos', description: 'Leches, quesos, yogures y derivados' },
            { name: 'Limpieza y Hogar', description: 'Detergentes, desinfectantes y aseo' },
        ];
        const categoriesMap = new Map();
        for (const cat of categoriesData) {
            let category = await this.categoryRepo.findOne({ where: { name: cat.name } });
            if (!category) {
                category = await this.categoryRepo.save(this.categoryRepo.create(cat));
                this.logger.log(`Categoría creada: ${category.name}`);
            }
            categoriesMap.set(cat.name, category);
        }
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
        const suppliersMap = new Map();
        for (const sup of suppliersData) {
            let supplier = await this.supplierRepo.findOne({ where: { document: sup.document } });
            if (!supplier) {
                supplier = await this.supplierRepo.save(this.supplierRepo.create(sup));
                this.logger.log(`Proveedor creado: ${supplier.name}`);
            }
            suppliersMap.set(sup.name, supplier);
        }
        const customersData = [
            {
                document: '1001',
                name: 'Carlos Restrepo',
                email: 'carlos.restrepo@email.com',
                phone: '3001112233',
                isFrequent: true,
            },
            {
                document: '1002',
                name: 'Laura Gómez',
                email: 'laura.gomez@email.com',
                phone: '3004445566',
                isFrequent: false,
            },
        ];
        for (const c of customersData) {
            const exists = await this.customerRepo.findOne({ where: { document: c.document } });
            if (!exists) {
                await this.customerRepo.save(this.customerRepo.create(c));
                this.logger.log(`Cliente registrado: ${c.name} (Frecuente: ${c.isFrequent})`);
            }
        }
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
                initialStock: 2,
            },
            {
                sku: 'ABR-001',
                name: 'Arroz Diana 1kg',
                description: 'Arroz blanco seleccionado 1 kilogramo',
                price: 4500,
                categoryName: 'Granos y Abarrotes',
                supplierName: 'Molinos y Granos del Valle',
                minStockSafety: 15,
                avgDailySales: 10,
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
                avgDailySales: 8,
                initialStock: 5,
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
            const category = categoriesMap.get(prodData.categoryName);
            const supplier = suppliersMap.get(prodData.supplierName);
            if (!product) {
                product = await this.productRepo.save(this.productRepo.create({
                    sku: prodData.sku,
                    name: prodData.name,
                    description: prodData.description,
                    price: prodData.price,
                    categoryId: category.id,
                    supplierId: supplier.id,
                    minStockSafety: prodData.minStockSafety,
                    avgDailySales: prodData.avgDailySales,
                }));
                this.logger.log(`Producto creado: ${product.name} (SKU: ${product.sku})`);
            }
            let inventory = await this.inventoryRepo.findOne({ where: { productId: product.id } });
            if (!inventory) {
                inventory = await this.inventoryRepo.save(this.inventoryRepo.create({
                    productId: product.id,
                    currentStock: prodData.initialStock,
                }));
                this.logger.log(`Inventario inicial para ${product.name}: ${inventory.currentStock} unidades`);
            }
            const leadTime = supplier.deliveryLeadTimeDays;
            const reorderPoint = Math.round(Number(prodData.avgDailySales) * leadTime + prodData.minStockSafety);
            if (inventory.currentStock <= reorderPoint) {
                const existingAlert = await this.alertRepo.findOne({
                    where: { productId: product.id, isResolved: false },
                });
                if (!existingAlert) {
                    const priority = inventory.currentStock <= prodData.minStockSafety ? entities_1.AlertPriority.ALTA : entities_1.AlertPriority.MEDIA;
                    await this.alertRepo.save(this.alertRepo.create({
                        productId: product.id,
                        currentStock: inventory.currentStock,
                        reorderPoint,
                        priority,
                    }));
                    this.logger.log(`⚠️ Alerta generada para ${product.name}: Stock ${inventory.currentStock} <= Punto Reposición ${reorderPoint} (Prioridad: ${priority})`);
                }
            }
        }
        this.logger.log('✅ Siembra de datos completada satisfactoriamente.');
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = SeedService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Role)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(entities_1.Category)),
    __param(3, (0, typeorm_1.InjectRepository)(entities_1.Supplier)),
    __param(4, (0, typeorm_1.InjectRepository)(entities_1.Product)),
    __param(5, (0, typeorm_1.InjectRepository)(entities_1.Inventory)),
    __param(6, (0, typeorm_1.InjectRepository)(entities_1.Customer)),
    __param(7, (0, typeorm_1.InjectRepository)(entities_1.Promotion)),
    __param(8, (0, typeorm_1.InjectRepository)(entities_1.RestockingAlert)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map