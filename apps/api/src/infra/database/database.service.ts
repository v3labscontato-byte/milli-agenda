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
      await this.ensureGoalsTable()
    } catch (err) {
      this.logger.error(`Database connection failed: ${err.message}`)
      this.logger.error('Check DATABASE_URL environment variable')
    }
  }

  private async ensureGoalsTable() {
    try {
      await this.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "goals" (
          "id" TEXT NOT NULL,
          "tenantId" TEXT NOT NULL,
          "tipo" TEXT NOT NULL,
          "periodo" TEXT NOT NULL,
          "valor" DECIMAL(12,2) NOT NULL,
          "dataInicio" TIMESTAMP(3) NOT NULL,
          "dataFim" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
        )
      `)
      await this.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "goals_tenantId_idx" ON "goals"("tenantId")`)
      await this.$executeRawUnsafe(`
        DO $$ BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_constraint WHERE conname = 'goals_tenantId_fkey'
          ) THEN
            ALTER TABLE "goals" ADD CONSTRAINT "goals_tenantId_fkey"
              FOREIGN KEY ("tenantId") REFERENCES "tenants"("id")
              ON DELETE CASCADE ON UPDATE CASCADE;
          END IF;
        END $$
      `)
      this.logger.log('goals table ready')
    } catch (err) {
      this.logger.warn(`ensureGoalsTable: ${err.message}`)
    }
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
