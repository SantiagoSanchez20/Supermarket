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
exports.UpdateProductDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class UpdateProductDto {
    sku;
    name;
    description;
    price;
    categoryId;
    supplierId;
    minStockSafety;
    avgDailySales;
    isActive;
}
exports.UpdateProductDto = UpdateProductDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'BEB-002-MOD', description: 'Código único / SKU' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El SKU debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "sku", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Jugo Hit Naranja 1.5L', description: 'Nombre comercial' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'El nombre debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Bebida de fruta sabor naranja presentación familiar', description: 'Descripción' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'La descripción debe ser una cadena de texto' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4500.0, description: 'Precio unitario (> 0)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El precio debe ser un número válido' }),
    (0, class_validator_1.IsPositive)({ message: 'El precio debe ser un valor positivo mayor a 0' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-de-categoria', description: 'ID de la categoría' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de categoría debe ser un UUID v4 válido' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "categoryId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-de-proveedor', description: 'ID del proveedor' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'El ID de proveedor debe ser un UUID v4 válido' }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 12, description: 'Stock de seguridad mínimo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'El stock de seguridad debe ser numérico' }),
    (0, class_validator_1.Min)(0, { message: 'El stock de seguridad no puede ser negativo' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "minStockSafety", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 7.5, description: 'Promedio de ventas diarias' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Las ventas promedio deben ser numéricas' }),
    (0, class_validator_1.Min)(0, { message: 'Las ventas promedio no pueden ser negativas' }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "avgDailySales", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Estado activo/inactivo' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)({ message: 'El estado debe ser booleano' }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isActive", void 0);
//# sourceMappingURL=update-product.dto.js.map