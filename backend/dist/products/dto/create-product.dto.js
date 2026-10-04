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
exports.CreateProductDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateProductDto {
    sku;
    name;
    description;
    price;
    categoryId;
    supplierId;
    minStockSafety;
    avgDailySales;
    initialStock;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'BEB-002', description: 'Código único / SKU del producto' }),
    (0, class_validator_1.IsString)({ message: 'El SKU debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El SKU es requerido' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Jugo Hit Naranja 1L', description: 'Nombre comercial del producto' }),
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser una cadena de texto' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El nombre es requerido' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bebida de fruta sabor naranja', description: 'Descripción detallada' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 3800.0, description: 'Precio unitario del producto (> 0)' }),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio debe ser un número válido' }),
    (0, class_validator_1.IsPositive)({ message: 'El precio debe ser un valor positivo mayor a 0' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-de-categoria', description: 'ID de la categoría' }),
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de categoría debe ser un UUID v4 válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'La categoría es requerida' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-de-proveedor', description: 'ID del proveedor' }),
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de proveedor debe ser un UUID v4 válido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'El proveedor es requerido' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, description: 'Stock de seguridad mínimo (RB-07)', default: 10 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El stock de seguridad debe ser numérico' }),
    (0, class_validator_1.Min)(0, { message: 'El stock de seguridad no puede ser negativo' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "minStockSafety", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5.0, description: 'Promedio de ventas diarias estimadas (RB-07)', default: 5.0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Las ventas promedio deben ser numéricas' }),
    (0, class_validator_1.Min)(0, { message: 'Las ventas promedio no pueden ser negativas' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "avgDailySales", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 20, description: 'Existencia o stock inicial (>= 0)', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El stock inicial debe ser numérico' }),
    (0, class_validator_1.Min)(0, { message: 'El stock inicial no puede ser negativo' }),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "initialStock", void 0);
//# sourceMappingURL=create-product.dto.js.map