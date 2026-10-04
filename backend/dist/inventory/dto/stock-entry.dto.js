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
exports.StockEntryDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class StockEntryDto {
    productId;
    quantity;
    notes;
}
exports.StockEntryDto = StockEntryDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-de-producto', description: 'ID del producto a reabastecer' }),
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de producto debe ser un UUID v4 válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El ID de producto es requerido' }),
    __metadata("design:type", String)
], StockEntryDto.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25, description: 'Cantidad de unidades que ingresan al inventario (> 0)' }),
    (0, class_validator_1.IsInt)({ message: 'La cantidad debe ser un número entero' }),
    (0, class_validator_1.IsPositive)({ message: 'La cantidad debe ser un valor positivo mayor a cero' }),
    __metadata("design:type", Number)
], StockEntryDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Recepción de pedido con Factura Proveedor #8492', description: 'Notas u observaciones' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Las notas deben ser una cadena de texto' }),
    __metadata("design:type", String)
], StockEntryDto.prototype, "notes", void 0);
//# sourceMappingURL=stock-entry.dto.js.map