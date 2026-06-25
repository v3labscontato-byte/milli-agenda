import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name)

  async onModuleInit() {
    try {
      await this.$connect()
      this.logger.log('Database connected')
    } catch (err) {
      this.logger.error(`Database connection failed: ${err.message}`)
      this.logger.error('Check DATABASE_URL environment variable')
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
