-- CreateTable
CREATE TABLE "commission_payments" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comprovanteUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_accounts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valorPadrao" DECIMAL(10,2),
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "diaPagamento" INTEGER NOT NULL DEFAULT 5,
    "ativa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_of_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chart_of_account_entries" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "chartOfAccountId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chart_of_account_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "chartOfAccountEntryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commission_payments_tenantId_professionalId_idx" ON "commission_payments"("tenantId", "professionalId");

-- CreateIndex
CREATE INDEX "chart_of_accounts_tenantId_idx" ON "chart_of_accounts"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "chart_of_account_entries_chartOfAccountId_period_key" ON "chart_of_account_entries"("chartOfAccountId", "period");

-- CreateIndex
CREATE INDEX "chart_of_account_entries_tenantId_period_idx" ON "chart_of_account_entries"("tenantId", "period");

-- CreateIndex
CREATE UNIQUE INDEX "expenses_chartOfAccountEntryId_key" ON "expenses"("chartOfAccountEntryId");

-- CreateIndex
CREATE INDEX "expenses_tenantId_data_idx" ON "expenses"("tenantId", "data");

-- AddForeignKey
ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commission_payments" ADD CONSTRAINT "commission_payments_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_accounts" ADD CONSTRAINT "chart_of_accounts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_account_entries" ADD CONSTRAINT "chart_of_account_entries_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chart_of_account_entries" ADD CONSTRAINT "chart_of_account_entries_chartOfAccountId_fkey" FOREIGN KEY ("chartOfAccountId") REFERENCES "chart_of_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_chartOfAccountEntryId_fkey" FOREIGN KEY ("chartOfAccountEntryId") REFERENCES "chart_of_account_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
