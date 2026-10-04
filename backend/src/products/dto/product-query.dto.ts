import { IsOptional, IsString, IsBooleanString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ProductQueryDto {
  @ApiPropertyOptional({ example: 'coca', description: 'Término de búsqueda por nombre o SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'uuid-categoria', description: 'Filtrar por categoría' })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;

  @ApiPropertyOptional({ example: 'true', description: 'Filtrar por estado activo/inactivo' })
  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}
