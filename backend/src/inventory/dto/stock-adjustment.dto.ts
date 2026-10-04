import { IsNotEmpty, IsUUID, IsInt, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StockAdjustmentDto {
  @ApiProperty({ example: 'uuid-de-producto', description: 'ID del producto a ajustar' })
  @IsUUID('4', { message: 'El ID de producto debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El ID de producto es requerido' })
  productId: string;

  @ApiProperty({ example: 40, description: 'Nuevo stock auditado (>= 0)' })
  @IsInt({ message: 'El nuevo stock debe ser un número entero' })
  @Min(0, { message: 'El inventario de un producto nunca puede quedar con una cantidad menor a cero.' })
  newStock: number;

  @ApiProperty({ example: 'Conteo físico anual de inventario en bodega', description: 'Motivo del ajuste' })
  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El motivo del ajuste es requerido' })
  reason: string;
}
