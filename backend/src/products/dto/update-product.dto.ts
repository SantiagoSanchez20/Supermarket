import {
  IsString,
  IsNumber,
  IsPositive,
  IsUUID,
  IsOptional,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'BEB-002-MOD', description: 'Código único / SKU' })
  @IsOptional()
  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  sku?: string;

  @ApiPropertyOptional({ example: 'Jugo Hit Naranja 1.5L', description: 'Nombre comercial' })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @ApiPropertyOptional({ example: 'Bebida de fruta sabor naranja presentación familiar', description: 'Descripción' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiPropertyOptional({ example: 4500.0, description: 'Precio unitario (> 0)' })
  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @IsPositive({ message: 'El precio debe ser un valor positivo mayor a 0' })
  price?: number;

  @ApiPropertyOptional({ example: 'uuid-de-categoria', description: 'ID de la categoría' })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID v4 válido' })
  categoryId?: string;

  @ApiPropertyOptional({ example: 'uuid-de-proveedor', description: 'ID del proveedor' })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de proveedor debe ser un UUID v4 válido' })
  supplierId?: string;

  @ApiPropertyOptional({ example: 12, description: 'Stock de seguridad mínimo' })
  @IsOptional()
  @IsNumber({}, { message: 'El stock de seguridad debe ser numérico' })
  @Min(0, { message: 'El stock de seguridad no puede ser negativo' })
  minStockSafety?: number;

  @ApiPropertyOptional({ example: 7.5, description: 'Promedio de ventas diarias' })
  @IsOptional()
  @IsNumber({}, { message: 'Las ventas promedio deben ser numéricas' })
  @Min(0, { message: 'Las ventas promedio no pueden ser negativas' })
  avgDailySales?: number;

  @ApiPropertyOptional({ example: true, description: 'Estado activo/inactivo' })
  @IsOptional()
  @IsBoolean({ message: 'El estado debe ser booleano' })
  isActive?: boolean;
}
