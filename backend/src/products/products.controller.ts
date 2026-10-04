import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '../database/entities/role.entity';

@ApiTags('Products (Gestión de Productos)')
@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo producto con su inventario inicial (Solo Administrador)' })
  @ApiResponse({ status: 201, description: 'Producto creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos de validación inválidos.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para realizar esta operación.' })
  async create(@Body() createDto: CreateProductDto, @CurrentUser('id') userId: string) {
    return this.productsService.create(createDto, userId);
  }

  @Get()
  @Roles(RoleType.ADMIN, RoleType.CAJERO, RoleType.ABASTECIMIENTO)
  @ApiOperation({ summary: 'Consultar catálogo de productos con filtros y estado de stock' })
  async findAll(@Query() queryDto: ProductQueryDto) {
    return this.productsService.findAll(queryDto);
  }

  @Get(':id')
  @Roles(RoleType.ADMIN, RoleType.CAJERO, RoleType.ABASTECIMIENTO)
  @ApiOperation({ summary: 'Consultar un producto por su ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('sku/:sku')
  @Roles(RoleType.ADMIN, RoleType.CAJERO, RoleType.ABASTECIMIENTO)
  @ApiOperation({ summary: 'Buscar un producto por su código / SKU' })
  async findBySku(@Param('sku') sku: string) {
    return this.productsService.findBySku(sku);
  }

  @Patch(':id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Modificar datos de un producto (Solo Administrador)' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
    return this.productsService.update(id, updateDto);
  }

  @Patch(':id/toggle-active')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Activar o desactivar un producto (Solo Administrador)' })
  async toggleActive(@Param('id') id: string) {
    return this.productsService.toggleActive(id);
  }
}
