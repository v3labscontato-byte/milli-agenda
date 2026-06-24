import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import Redis from 'ioredis'

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private client: Redis

  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379')
  }

  async onModuleDestroy() {
    await this.client.quit()
  }

  async get<T>(key: string): Promise<T | null> {
    const val = await this.client.get(key)
    return val ? (JSON.parse(val) as T) : null
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern)
    if (keys.length) await this.client.del(...keys)
  }
}
