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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = __importDefault(require("ioredis"));
const crypto_1 = require("crypto");
let RedisService = RedisService_1 = class RedisService {
    configService;
    logger = new common_1.Logger(RedisService_1.name);
    client = null;
    isConnected = false;
    constructor(configService) {
        this.configService = configService;
    }
    onModuleInit() {
        const host = this.configService.get('REDIS_HOST', 'localhost');
        const port = this.configService.get('REDIS_PORT', 6379);
        try {
            this.client = new ioredis_1.default({
                host,
                port,
                retryStrategy: (times) => {
                    if (times > 3) {
                        this.logger.warn(`Redis no disponible en ${host}:${port}. Continuando en modo sin caché/lock distribuido.`);
                        return null;
                    }
                    return Math.min(times * 200, 1000);
                },
                maxRetriesPerRequest: 1,
            });
            this.client.on('connect', () => {
                this.isConnected = true;
                this.logger.log(`Conectado exitosamente a Redis en ${host}:${port}`);
            });
            this.client.on('error', (err) => {
                this.isConnected = false;
                this.logger.warn(`Advertencia Redis: ${err.message}`);
            });
        }
        catch (e) {
            this.logger.warn(`No se pudo inicializar cliente Redis: ${e.message}`);
        }
    }
    onModuleDestroy() {
        if (this.client) {
            this.client.disconnect();
        }
    }
    async get(key) {
        if (!this.isConnected || !this.client)
            return null;
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch {
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        if (!this.isConnected || !this.client)
            return;
        try {
            const serialized = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.set(key, serialized, 'EX', ttlSeconds);
            }
            else {
                await this.client.set(key, serialized);
            }
        }
        catch (err) {
            this.logger.warn(`Fallo al escribir en Redis: ${err.message}`);
        }
    }
    async del(key) {
        if (!this.isConnected || !this.client)
            return;
        try {
            await this.client.del(key);
        }
        catch { }
    }
    async acquireLock(resource, ttlMs = 5000) {
        if (!this.isConnected || !this.client) {
            return 'fallback-lock-token';
        }
        const token = (0, crypto_1.randomUUID)();
        const lockKey = `lock:${resource}`;
        try {
            const result = await this.client.set(lockKey, token, 'PX', ttlMs, 'NX');
            return result === 'OK' ? token : null;
        }
        catch {
            return 'fallback-lock-token';
        }
    }
    async releaseLock(resource, token) {
        if (!this.isConnected || !this.client || token === 'fallback-lock-token') {
            return true;
        }
        const lockKey = `lock:${resource}`;
        const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
        try {
            const result = await this.client.eval(luaScript, 1, lockKey, token);
            return result === 1;
        }
        catch {
            return false;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map