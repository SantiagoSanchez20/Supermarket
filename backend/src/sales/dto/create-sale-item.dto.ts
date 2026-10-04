import { IsNotEmpty, IsUUID, IsInt, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({ example: 'uuid-del-producto', description: 'ID del producto a vender' })
  @IsUUID('4', { message: 'El ID de producto debe ser un UUID v4 válido' })
  @IsNotEmpty({ message: 'El ID de producto es requerido' })
  productId: string;

  @ApiProperty({ example: 2, description: 'Cantidad de unidades (> 0)' })
  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @IsPositive({ message: 'La cantidad debe ser mayor a cero' })
  quantity: number;
}
