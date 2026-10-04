import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { randomUUID } from 'crypto';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    try {
      this.client = new Redis({
        host,
        port,
        retryStrategy: (times) => {
          if (times > 3) {
            this.logger.warn(`Redis no disponible en ${host}:${port}. Continuando en modo sin caché/lock distribuido.`);
            return null; // Stop retrying automatically to not spam logs
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
    } catch (e: any) {
      this.logger.warn(`No se pudo inicializar cliente Redis: ${e.message}`);
    }
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? (JSON.parse(data) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err: any) {
      this.logger.warn(`Fallo al escribir en Redis: ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch {}
  }

  /**
   * Adquiere un lock distribuido para control de concurrencia (RB-12).
   * Devuelve un token único si se adquirió con éxito, o null si el recurso está bloqueado.
   */
  async acquireLock(resource: string, ttlMs = 5000): Promise<string | null> {
    if (!this.isConnected || !this.client) {
      // Si Redis no está disponible, el lock a nivel BD (SELECT ... FOR UPDATE) asegura la atomicidad
      return 'fallback-lock-token';
    }
    const token = randomUUID();
    const lockKey = `lock:${resource}`;
    try {
      const result = await this.client.set(lockKey, token, 'PX', ttlMs, 'NX');
      return result === 'OK' ? token : null;
    } catch {
      return 'fallback-lock-token';
    }
  }

  /**
   * Libera un lock distribuido de manera segura verificando el token.
   */
  async releaseLock(resource: string, token: string): Promise<boolean> {
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
    } catch {
      return false;
    }
  }
}
