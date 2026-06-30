-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('UNIT', 'ML', 'G', 'KG', 'LITER');

-- CreateEnum
CREATE TYPE "ProductClassification" AS ENUM ('RESALE', 'INTERNAL_USE', 'PROCEDURE', 'CONSUMABLE');

-- AlterTable
ALTER TABLE "products"
  ADD COLUMN "notes" TEXT,
  ADD COLUMN "maxStock" INTEGER,
  ADD COLUMN "sku" TEXT,
  ADD COLUMN "brand" TEXT,
  ADD COLUMN "supplierName" TEXT,
  ADD COLUMN "unit" "ProductUnit" NOT NULL DEFAULT 'UNIT',
  ADD COLUMN "imageUrl" TEXT,
  ADD COLUMN "classifications" "ProductClassification"[] NOT NULL DEFAULT ARRAY[]::"ProductClassification"[],
  ADD COLUMN "location" TEXT;
