import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis
  private readonly logger = new Logger(CacheService.name)
  private connected = false

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 0,
    })
    this.client.on('error', (err) => {
      this.logger.warn(`Redis unavailable: ${err.message}`)
      this.connected = false
    })
    this.client.connect().then(() => {
      this.connected = true
      this.logger.log('Redis connected')
    }).catch((err) => {
      this.logger.warn(`Redis connect failed: ${err.message} — cache disabled`)
    })
  }

  async onModuleDestroy() {
    if (this.connected) await this.client.quit()
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null
    try {
      const val = await this.client.get(key)
      return val ? (JSON.parse(val) as T) : null
    } catch { return null }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.connected) return
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    } catch { /* no-op */ }
  }

  async del(key: string): Promise<void> {
    if (!this.connected) return
    try { await this.client.del(key) } catch { /* no-op */ }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.connected) return
    try {
      const keys = await this.client.keys(pattern)
      if (keys.length) await this.client.del(...keys)
    } catch { /* no-op */ }
  }
}
