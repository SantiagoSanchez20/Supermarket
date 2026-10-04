import {
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSaleItemDto } from './create-sale-item.dto';

export class CreateSaleDto {
  @ApiPropertyOptional({ example: 'uuid-del-cliente', description: 'ID del cliente opcional (frecuente o regular)' })
  @IsOptional()
  @IsUUID('4', { message: 'El ID de cliente debe ser un UUID v4 válido' })
  customerId?: string;

  @ApiProperty({ type: [CreateSaleItemDto], description: 'Listado de productos y cantidades' })
  @IsArray({ message: 'Los ítems de venta deben ser una lista' })
  @ArrayMinSize(1, { message: 'La venta debe contener al menos un producto' })
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];
}
