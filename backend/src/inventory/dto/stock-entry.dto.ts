import { IsNotEmpty, IsUUID, IsInt, IsPositive, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StockEntryDto {
  @ApiProperty({ example: 'uuid-de-producto', description: 'ID del producto a reabastecer' })
  @IsUUID('4', { message: 'El ID de producto debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El ID de producto es requerido' })
  productId: string;

  @ApiProperty({ example: 25, description: 'Cantidad de unidades que ingresan al inventario (> 0)' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser un valor positivo mayor a cero' })
  quantity: number;

  @ApiPropertyOptional({ example: 'Recepción de pedido con Factura Proveedor #8492', description: 'Notas u observaciones' })
  @IsOptional()
  @IsString({ message: 'Las notas deben ser una cadena de texto' })
  notes?: string;
}
