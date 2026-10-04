import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsPositive,
  IsUUID,
  IsOptional,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'BEB-002', description: 'Código único / SKU del producto' })
  @IsString({ message: 'El SKU debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El SKU es requerido' })
  sku: string;

  @ApiProperty({ example: 'Jugo Hit Naranja 1L', description: 'Nombre comercial del producto' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  name: string;

  @ApiPropertyOptional({ example: 'Bebida de fruta sabor naranja', description: 'Descripción detallada' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  description?: string;

  @ApiProperty({ example: 3800.0, description: 'Precio unitario del producto (> 0)' })
  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @IsPositive({ message: 'El precio debe ser un valor positivo mayor a 0' })
  price: number;

  @ApiProperty({ example: 'uuid-de-categoria', description: 'ID de la categoría' })
  @IsUUID('4', { message: 'El ID de categoría debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'La categoría es requerida' })
  categoryId: string;

  @ApiProperty({ example: 'uuid-de-proveedor', description: 'ID del proveedor' })
  @IsUUID('4', { message: 'El ID de proveedor debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El proveedor es requerido' })
  supplierId: string;

  @ApiPropertyOptional({ example: 10, description: 'Stock de seguridad mínimo (RB-07)', default: 10 })
  @IsOptional()
  @IsNumber({}, { message: 'El stock de seguridad debe ser numérico' })
  @Min(0, { message: 'El stock de seguridad no puede ser negativo' })
  minStockSafety?: number;

  @ApiPropertyOptional({ example: 5.0, description: 'Promedio de ventas diarias estimadas (RB-07)', default: 5.0 })
  @IsOptional()
  @IsNumber({}, { message: 'Las ventas promedio deben ser numéricas' })
  @Min(0, { message: 'Las ventas promedio no pueden ser negativas' })
  avgDailySales?: number;

  @ApiPropertyOptional({ example: 20, description: 'Existencia o stock inicial (>= 0)', default: 0 })
  @IsOptional()
  @IsNumber({}, { message: 'El stock inicial debe ser numérico' })
  @Min(0, { message: 'El stock inicial no puede ser negativo' })
  initialStock?: number;
}
