-- Migration: add_app_cliente_fields
ALTER TABLE "tenants"
  ADD COLUMN "instagram"           TEXT,
  ADD COLUMN "acceptingNewClients" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "welcomeMessage"      TEXT,
  ADD COLUMN "googlePlaceId"       TEXT,
  ADD COLUMN "referralBonus"       DECIMAL(10,2),
  ADD COLUMN "pointsPerReal"       INTEGER NOT NULL DEFAULT 1;
