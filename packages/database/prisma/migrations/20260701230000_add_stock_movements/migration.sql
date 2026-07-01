CREATE TYPE "StockMovementType" AS ENUM (
  'ENTRADA', 'SAIDA', 'AJUSTE', 'INVENTARIO'
);

CREATE TABLE "stock_movements" (
  "id"          TEXT NOT NULL,
  "tenantId"    TEXT NOT NULL,
  "productId"   TEXT NOT NULL,
  "type"        "StockMovementType" NOT NULL,
  "quantity"    INTEGER NOT NULL,
  "reason"      TEXT,
  "costPrice"   DECIMAL(10,2),
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdBy"   TEXT NOT NULL,

  CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "stock_movements_tenantId_fkey"
    FOREIGN KEY ("tenantId") REFERENCES "tenants"("id"),
  CONSTRAINT "stock_movements_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id")
);

CREATE INDEX "stock_movements_tenantId_productId_idx"
  ON "stock_movements"("tenantId", "productId");
