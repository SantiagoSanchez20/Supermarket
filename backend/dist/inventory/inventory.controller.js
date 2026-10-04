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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const inventory_service_1 = require("./inventory.service");
const stock_entry_dto_1 = require("./dto/stock-entry.dto");
const stock_adjustment_dto_1 = require("./dto/stock-adjustment.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const role_entity_1 = require("../database/entities/role.entity");
let InventoryController = class InventoryController {
    inventoryService;
    constructor(inventoryService) {
        this.inventoryService = inventoryService;
    }
    async getAll() {
        return this.inventoryService.getAll();
    }
    async getByProductId(productId) {
        return this.inventoryService.getByProductId(productId);
    }
    async registerStockEntry(dto, userId) {
        return this.inventoryService.registerStockEntry(dto, userId);
    }
    async adjustStock(dto, userId) {
        return this.inventoryService.adjustStock(dto, userId);
    }
    async getMovements(productId, limit = 50, offset = 0) {
        return this.inventoryService.getMovements(productId, Number(limit), Number(offset));
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.ABASTECIMIENTO, role_entity_1.RoleType.CAJERO),
    (0, swagger_1.ApiOperation)({ summary: 'Consultar listado general de existencias, puntos de reposición e indicadores' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)('product/:productId'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.ABASTECIMIENTO, role_entity_1.RoleType.CAJERO),
    (0, swagger_1.ApiOperation)({ summary: 'Consultar existencias de un producto específico' }),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getByProductId", null);
__decorate([
    (0, common_1.Post)('entry'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.ABASTECIMIENTO),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar entrada de mercancía por reposición de proveedor' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Entrada registrada y kardex actualizado.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'No tiene permisos para realizar esta operación.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_entry_dto_1.StockEntryDto, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "registerStockEntry", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Realizar ajuste manual de inventario con motivo de auditoría (Solo Administrador)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Ajuste procesado y kardex registrado.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Stock negativo rechazado por RB-06.' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'No tiene permisos para realizar esta operación.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [stock_adjustment_dto_1.StockAdjustmentDto, String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjustStock", null);
__decorate([
    (0, common_1.Get)('movements'),
    (0, roles_decorator_1.Roles)(role_entity_1.RoleType.ADMIN, role_entity_1.RoleType.ABASTECIMIENTO),
    (0, swagger_1.ApiOperation)({ summary: 'Consultar historial de movimientos de inventario (Kardex auditado)' }),
    (0, swagger_1.ApiQuery)({ name: 'productId', required: false, description: 'Filtrar por producto' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, description: 'Límite de registros (default 50)' }),
    (0, swagger_1.ApiQuery)({ name: 'offset', required: false, description: 'Desplazamiento / paginación' }),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getMovements", null);
exports.InventoryController = InventoryController = __decorate([
    (0, swagger_1.ApiTags)('Inventory (Gestión de Inventario y Kardex)'),
    (0, common_1.Controller)('inventory'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map