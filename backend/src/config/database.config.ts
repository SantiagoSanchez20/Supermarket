import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import {
  Role,
  User,
  Category,
  Supplier,
  Product,
  Inventory,
  Customer,
  Promotion,
  Sale,
  SaleDetail,
  InventoryMovement,
  RestockingAlert,
} from '../database/entities';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const dbType = configService.get<string>('DB_TYPE', 'postgres');

  const entities = [
    Role,
    User,
    Category,
    Supplier,
    Product,
    Inventory,
    Customer,
    Promotion,
    Sale,
    SaleDetail,
    InventoryMovement,
    RestockingAlert,
  ];

  if (dbType === 'sqlite' || dbType === 'better-sqlite3') {
    return {
      type: 'better-sqlite3',
      database: configService.get<string>('DB_NAME', 'smartmarket.sqlite'),
      entities,
      synchronize: true,
      logging: configService.get<string>('NODE_ENV') === 'development',
    };
  }

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USER', 'smartmarket'),
    password: configService.get<string>('DB_PASSWORD', 'smartmarket_secret'),
    database: configService.get<string>('DB_NAME', 'smartmarket_db'),
    entities,
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging: configService.get<string>('NODE_ENV') === 'development',
  };
};
