-- AlterTable: add coverImageUrl and primaryColor to tenants
-- Applied directly via SQL (IF NOT EXISTS) on 2026-07-01 — homolog and production
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "primaryColor" TEXT DEFAULT '#3D2B1F';
