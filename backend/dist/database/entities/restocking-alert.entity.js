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
exports.RestockingAlert = exports.AlertPriority = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
var AlertPriority;
(function (AlertPriority) {
    AlertPriority["ALTA"] = "ALTA";
    AlertPriority["MEDIA"] = "MEDIA";
    AlertPriority["BAJA"] = "BAJA";
})(AlertPriority || (exports.AlertPriority = AlertPriority = {}));
let RestockingAlert = class RestockingAlert {
    id;
    productId;
    product;
    currentStock;
    reorderPoint;
    priority;
    isResolved;
    createdAt;
    resolvedAt;
};
exports.RestockingAlert = RestockingAlert;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RestockingAlert.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id' }),
    __metadata("design:type", String)
], RestockingAlert.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.Product, (product) => product.alerts, { eager: true, onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.Product)
], RestockingAlert.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_stock', type: 'int' }),
    __metadata("design:type", Number)
], RestockingAlert.prototype, "currentStock", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reorder_point', type: 'int' }),
    __metadata("design:type", Number)
], RestockingAlert.prototype, "reorderPoint", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        default: AlertPriority.MEDIA,
    }),
    __metadata("design:type", String)
], RestockingAlert.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_resolved', default: false }),
    __metadata("design:type", Boolean)
], RestockingAlert.prototype, "isResolved", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], RestockingAlert.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_at', nullable: true }),
    __metadata("design:type", Date)
], RestockingAlert.prototype, "resolvedAt", void 0);
exports.RestockingAlert = RestockingAlert = __decorate([
    (0, typeorm_1.Entity)('restocking_alerts')
], RestockingAlert);
//# sourceMappingURL=restocking-alert.entity.js.map