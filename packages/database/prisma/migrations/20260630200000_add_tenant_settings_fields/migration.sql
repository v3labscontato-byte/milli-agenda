-- AlterTable: add tenant settings fields (Horários, Pagamentos, Meu Salão)
ALTER TABLE "tenants" ADD COLUMN "businessHours" JSONB;
ALTER TABLE "tenants" ADD COLUMN "slotGapMinutes" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "tenants" ADD COLUMN "minAdvanceHours" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "tenants" ADD COLUMN "maxAdvanceDays" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "tenants" ADD COLUMN "acceptedPaymentMethods" JSONB NOT NULL DEFAULT '["PIX","CASH","CREDIT_CARD","DEBIT_CARD","VOUCHER","BANK_TRANSFER"]';
ALTER TABLE "tenants" ADD COLUMN "slogan" TEXT;
ALTER TABLE "tenants" ADD COLUMN "address" TEXT;
ALTER TABLE "tenants" ADD COLUMN "neighborhood" TEXT;
ALTER TABLE "tenants" ADD COLUMN "cep" TEXT;
ALTER TABLE "tenants" ADD COLUMN "city" TEXT;
ALTER TABLE "tenants" ADD COLUMN "state" TEXT;
