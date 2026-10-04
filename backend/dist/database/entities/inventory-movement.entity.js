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
exports.InventoryMovement = exports.MovementType = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const sale_entity_1 = require("./sale.entity");
const user_entity_1 = require("./user.entity");
var MovementType;
(function (MovementType) {
    MovementType["VENTA"] = "VENTA";
    MovementType["ENTRADA"] = "ENTRADA";
    MovementType["AJUSTE"] = "AJUSTE";
})(MovementType || (exports.MovementType = MovementType = {}));
let InventoryMovement = class InventoryMovement {
    id;
    productId;
    product;
    saleId;
    sale;
    userId;
    user;
    movementType;
    quantity;
    previousStock;
    resultingStock;
    notes;
    createdAt;
};
exports.InventoryMovement = InventoryMovement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryMovement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", String)
], InventoryMovement.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.movements),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], InventoryMovement.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sale_id', nullable: true }),
    __metadata("design:type", String)
], InventoryMovement.prototype, "saleId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sale_entity_1.Sale, (sale) => sale.movements, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'sale_id' }),
    __metadata("design:type", sale_entity_1.Sale)
], InventoryMovement.prototype, "sale", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], InventoryMovement.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], InventoryMovement.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'movement_type',
        type: 'varchar',
    }),
    __metadata("design:type", String)
], InventoryMovement.prototype, "movementType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], InventoryMovement.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'previous_stock', type: 'int' }),
    __metadata("design:type", Number)
], InventoryMovement.prototype, "previousStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resulting_stock', type: 'int' }),
    __metadata("design:type", Number)
], InventoryMovement.prototype, "resultingStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], InventoryMovement.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], InventoryMovement.prototype, "createdAt", void 0);
exports.InventoryMovement = InventoryMovement = __decorate([
    (0, typeorm_1.Entity)('inventory_movements')
], InventoryMovement);
//# sourceMappingURL=inventory-movement.entity.js.map