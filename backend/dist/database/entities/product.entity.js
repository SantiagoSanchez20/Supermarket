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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const typeorm_1 = require("typeorm");
const category_entity_1 = require("./category.entity");
const supplier_entity_1 = require("./supplier.entity");
const inventory_entity_1 = require("./inventory.entity");
const promotion_entity_1 = require("./promotion.entity");
const sale_detail_entity_1 = require("./sale-detail.entity");
const inventory_movement_entity_1 = require("./inventory-movement.entity");
const restocking_alert_entity_1 = require("./restocking-alert.entity");
let Product = class Product {
    id;
    sku;
    name;
    description;
    price;
    categoryId;
    category;
    supplierId;
    supplier;
    minStockSafety;
    avgDailySales;
    isActive;
    createdAt;
    updatedAt;
    inventory;
    promotions;
    saleDetails;
    movements;
    alerts;
};
exports.Product = Product;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Product.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], Product.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Product.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Product.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Product.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'category_id' }),
    __metadata("design:type", String)
], Product.prototype, "categoryId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => category_entity_1.Category, (category) => category.products, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'category_id' }),
    __metadata("design:type", category_entity_1.Category)
], Product.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'supplier_id' }),
    __metadata("design:type", String)
], Product.prototype, "supplierId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => supplier_entity_1.Supplier, (supplier) => supplier.products, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'supplier_id' }),
    __metadata("design:type", supplier_entity_1.Supplier)
], Product.prototype, "supplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'min_stock_safety', type: 'int', default: 10 }),
    __metadata("design:type", Number)
], Product.prototype, "minStockSafety", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avg_daily_sales', type: 'decimal', precision: 10, scale: 2, default: 5.0 }),
    __metadata("design:type", Number)
], Product.prototype, "avgDailySales", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Product.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Product.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Product.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => inventory_entity_1.Inventory, (inventory) => inventory.product),
    __metadata("design:type", inventory_entity_1.Inventory)
], Product.prototype, "inventory", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => promotion_entity_1.Promotion, (promotion) => promotion.products),
    (0, typeorm_1.JoinTable)({
        name: 'product_promotions',
        joinColumn: { name: 'product_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Array)
], Product.prototype, "promotions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sale_detail_entity_1.SaleDetail, (detail) => detail.product),
    __metadata("design:type", Array)
], Product.prototype, "saleDetails", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => inventory_movement_entity_1.InventoryMovement, (mov) => mov.product),
    __metadata("design:type", Array)
], Product.prototype, "movements", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => restocking_alert_entity_1.RestockingAlert, (alert) => alert.product),
    __metadata("design:type", Array)
], Product.prototype, "alerts", void 0);
exports.Product = Product = __decorate([
    (0, typeorm_1.Entity)('products'),
    (0, typeorm_1.Check)(`"price" > 0`),
    (0, typeorm_1.Check)(`"min_stock_safety" >= 0`),
    (0, typeorm_1.Check)(`"avg_daily_sales" >= 0`)
], Product);
//# sourceMappingURL=product.entity.js.map