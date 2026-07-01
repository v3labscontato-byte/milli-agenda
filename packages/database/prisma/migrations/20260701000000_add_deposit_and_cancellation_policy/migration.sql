-- Política de Sinal
ALTER TABLE "tenants" ADD COLUMN "depositType" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "tenants" ADD COLUMN "depositValue" DECIMAL(10,2);
ALTER TABLE "tenants" ADD COLUMN "depositRequired" BOOLEAN NOT NULL DEFAULT false;

-- Política de Cancelamento
ALTER TABLE "tenants" ADD COLUMN "cancellationMinHours" INTEGER NOT NULL DEFAULT 24;
ALTER TABLE "tenants" ADD COLUMN "cancellationFeePercent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "tenants" ADD COLUMN "cancellationRefundSignal" BOOLEAN NOT NULL DEFAULT true;
