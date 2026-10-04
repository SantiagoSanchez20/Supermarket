import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { MovementType } from '../database/entities/inventory-movement.entity';

describe('InventoryService (Pruebas de Lógica de Inventario y Reglas RB-04, RB-06, RB-07, RB-08)', () => {
  let service: InventoryService;
  let inventoryRepoMock: any;
  let productRepoMock: any;
  let movementRepoMock: any;
  let alertRepoMock: any;
  let dataSourceMock: any;

  beforeEach(() => {
    inventoryRepoMock = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((dto) => dto),
    };

    productRepoMock = {
      findOne: jest.fn(),
    };

    movementRepoMock = {
      create: jest.fn((dto) => dto),
      save: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    alertRepoMock = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((dto) => dto),
    };

    dataSourceMock = {
      createQueryRunner: jest.fn(),
    };

    service = new InventoryService(
      inventoryRepoMock,
      productRepoMock,
      movementRepoMock,
      alertRepoMock,
      dataSourceMock,
    );
  });

  describe('Cálculo de Punto de Reposición e Indicadores (RB-07 y RB-08)', () => {
    it('debe calcular correctamente el punto de reposición: (ventas_promedio * lead_time) + stock_seguridad', async () => {
      // Arroz Diana: Ventas promedio = 10, Lead time = 3, Stock seguridad = 15 -> Punto = (10 * 3) + 15 = 45
      const mockInventory = {
        id: 'inv-1',
        productId: 'prod-1',
        currentStock: 50,
        updatedAt: new Date(),
        product: {
          name: 'Arroz Diana 1kg',
          sku: 'ABR-001',
          avgDailySales: 10,
          minStockSafety: 15,
          supplier: { deliveryLeadTimeDays: 3 },
          category: { name: 'Granos' },
        },
      };

      inventoryRepoMock.find.mockResolvedValue([mockInventory]);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      const item = result[0];
      expect(item.reorderPoint).toBe(45); // RB-07: (10 * 3) + 15 = 45
      expect(item.currentStock).toBe(50);
      expect(item.needsRestock).toBe(false); // 50 > 45 -> no necesita reposición
    });

    it('debe marcar needsRestock=true cuando stock_actual <= punto_reposicion (RB-08)', async () => {
      // Aceite Premier: Ventas promedio = 8, Lead time = 4, Stock seguridad = 10 -> Punto = (8 * 4) + 10 = 42
      // Stock actual = 5 <= 42 -> Alerta de reposición
      const mockInventory = {
        id: 'inv-2',
        productId: 'prod-2',
        currentStock: 5,
        updatedAt: new Date(),
        product: {
          name: 'Aceite Premier 1L',
          sku: 'ABR-002',
          avgDailySales: 8,
          minStockSafety: 10,
          supplier: { deliveryLeadTimeDays: 4 },
          category: { name: 'Granos' },
        },
      };

      inventoryRepoMock.find.mockResolvedValue([mockInventory]);

      const result = await service.getAll();
      const item = result[0];

      expect(item.reorderPoint).toBe(42);
      expect(item.currentStock).toBe(5);
      expect(item.needsRestock).toBe(true); // RB-08
      expect(item.isCritical).toBe(true); // 5 <= 10 (stock de seguridad) -> crítico
    });
  });

  describe('Control de Inventario Negativo y Ajuste Manual (RB-06)', () => {
    it('debe rechazar un ajuste que intente dejar el inventario en negativo (RB-06)', async () => {
      await expect(
        service.adjustStock({
          productId: 'prod-1',
          newStock: -5,
          reason: 'Ajuste erróneo',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Descuento Transaccional para Ventas (RB-04, RB-05, RB-06)', () => {
    it('debe rechazar la venta si la cantidad solicitada supera el stock disponible (RB-04)', async () => {
      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          id: 'inv-coca',
          productId: 'prod-coca',
          currentStock: 5, // Stock disponible: 5
        }),
      };

      const mockManager = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      } as any;

      // Intenta comprar 6 unidades con stock = 5
      await expect(
        service.deductStockTransactional(mockManager, 'prod-coca', 6, 'sale-1', 'user-cajero'),
      ).rejects.toThrow('No hay suficiente inventario para completar la venta.');
    });

    it('debe descontar el inventario y registrar el kardex cuando el stock es suficiente (RB-05)', async () => {
      const inventoryRecord = {
        id: 'inv-coca',
        productId: 'prod-coca',
        currentStock: 5,
      };

      const mockQueryBuilder = {
        setLock: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(inventoryRecord),
      };

      const savedMovements: any[] = [];
      const mockManager = {
        createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        save: jest.fn().mockImplementation(async (entity) => {
          if (entity.movementType) savedMovements.push(entity);
          return entity;
        }),
        create: jest.fn((cls, data) => data),
        findOne: jest.fn().mockResolvedValue(null),
      } as any;

      // Compra 2 unidades con stock = 5
      const result = await service.deductStockTransactional(
        mockManager,
        'prod-coca',
        2,
        'sale-100',
        'cajero-1',
      );

      expect(result.previousStock).toBe(5);
      expect(result.resultingStock).toBe(3);
      expect(inventoryRecord.currentStock).toBe(3);

      // Verificación de auditoría en kardex (RB-05)
      expect(savedMovements).toHaveLength(1);
      expect(savedMovements[0].movementType).toBe(MovementType.VENTA);
      expect(savedMovements[0].quantity).toBe(2);
      expect(savedMovements[0].previousStock).toBe(5);
      expect(savedMovements[0].resultingStock).toBe(3);
    });
  });
});
