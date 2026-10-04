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
exports.StockAdjustmentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class StockAdjustmentDto {
    productId;
    newStock;
    reason;
}
exports.StockAdjustmentDto = StockAdjustmentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-de-producto', description: 'ID del producto a ajustar' }),
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de producto debe ser un UUID v4 válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de producto es requerido' }),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 40, description: 'Nuevo stock auditado (>= 0)' }),
    (0, class_validator_1.IsInt)({ message: 'El nuevo stock debe ser un número entero' }),
    (0, class_validator_1.Min)(0, { message: 'El inventario de un producto nunca puede quedar con una cantidad menor a cero.' }),
    __metadata("design:type", Number)
], StockAdjustmentDto.prototype, "newStock", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Conteo físico anual de inventario en bodega', description: 'Motivo del ajuste' }),
    (0, class_validator_1.IsString)({ message: 'El motivo debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El motivo del ajuste es requerido' }),
    __metadata("design:type", String)
], StockAdjustmentDto.prototype, "reason", void 0);
//# sourceMappingURL=stock-adjustment.dto.js.map