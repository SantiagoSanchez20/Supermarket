import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { StockEntryDto } from './dto/stock-entry.dto';
import { StockAdjustmentDto } from './dto/stock-adjustment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleType } from '../database/entities/role.entity';

@ApiTags('Inventory (Gestión de Inventario y Kardex)')
@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(RoleType.ADMIN, RoleType.ABASTECIMIENTO, RoleType.CAJERO)
  @ApiOperation({ summary: 'Consultar listado general de existencias, puntos de reposición e indicadores' })
  async getAll() {
    return this.inventoryService.getAll();
  }

  @Get('product/:productId')
  @Roles(RoleType.ADMIN, RoleType.ABASTECIMIENTO, RoleType.CAJERO)
  @ApiOperation({ summary: 'Consultar existencias de un producto específico' })
  async getByProductId(@Param('productId') productId: string) {
    return this.inventoryService.getByProductId(productId);
  }

  @Post('entry')
  @Roles(RoleType.ADMIN, RoleType.ABASTECIMIENTO)
  @ApiOperation({ summary: 'Registrar entrada de mercancía por reposición de proveedor' })
  @ApiResponse({ status: 201, description: 'Entrada registrada y kardex actualizado.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para realizar esta operación.' })
  async registerStockEntry(
    @Body() dto: StockEntryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.inventoryService.registerStockEntry(dto, userId);
  }

  @Post('adjust')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ summary: 'Realizar ajuste manual de inventario con motivo de auditoría (Solo Administrador)' })
  @ApiResponse({ status: 201, description: 'Ajuste procesado y kardex registrado.' })
  @ApiResponse({ status: 400, description: 'Stock negativo rechazado por RB-06.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para realizar esta operación.' })
  async adjustStock(
    @Body() dto: StockAdjustmentDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.inventoryService.adjustStock(dto, userId);
  }

  @Get('movements')
  @Roles(RoleType.ADMIN, RoleType.ABASTECIMIENTO)
  @ApiOperation({ summary: 'Consultar historial de movimientos de inventario (Kardex auditado)' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filtrar por producto' })
  @ApiQuery({ name: 'limit', required: false, description: 'Límite de registros (default 50)' })
  @ApiQuery({ name: 'offset', required: false, description: 'Desplazamiento / paginación' })
  async getMovements(
    @Query('productId') productId?: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.inventoryService.getMovements(productId, Number(limit), Number(offset));
  }
}
