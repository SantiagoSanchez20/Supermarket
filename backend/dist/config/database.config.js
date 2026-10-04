"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTypeOrmConfig = void 0;
const entities_1 = require("../database/entities");
const getTypeOrmConfig = (configService) => {
    const dbType = configService.get('DB_TYPE', 'postgres');
    const entities = [
        entities_1.Role,
        entities_1.User,
        entities_1.Category,
        entities_1.Supplier,
        entities_1.Product,
        entities_1.Inventory,
        entities_1.Customer,
        entities_1.Promotion,
        entities_1.Sale,
        entities_1.SaleDetail,
        entities_1.InventoryMovement,
        entities_1.RestockingAlert,
    ];
    if (dbType === 'sqlite' || dbType === 'better-sqlite3') {
        return {
            type: 'better-sqlite3',
            database: configService.get('DB_NAME', 'smartmarket.sqlite'),
            entities,
            synchronize: true,
            logging: configService.get('NODE_ENV') === 'development',
        };
    }
    return {
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USER', 'smartmarket'),
        password: configService.get('DB_PASSWORD', 'smartmarket_secret'),
        database: configService.get('DB_NAME', 'smartmarket_db'),
        entities,
        synchronize: configService.get('NODE_ENV') !== 'production',
        logging: configService.get('NODE_ENV') === 'development',
    };
};
exports.getTypeOrmConfig = getTypeOrmConfig;
//# sourceMappingURL=database.config.js.map