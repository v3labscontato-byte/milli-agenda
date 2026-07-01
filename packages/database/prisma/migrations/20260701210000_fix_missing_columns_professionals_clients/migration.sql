-- Colunas adicionadas ao schema.prisma mas sem migration correspondente
-- professionals: campos de horário de trabalho e configuração
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "workDays" INTEGER[] NOT NULL DEFAULT ARRAY[]::INTEGER[];
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "workStart" TEXT DEFAULT '08:00';
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "workEnd" TEXT DEFAULT '18:00';
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "birthDate" TEXT;
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "vinculo" TEXT;
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "enabledServices" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "professionals" ADD COLUMN IF NOT EXISTS "allowSimultaneous" BOOLEAN NOT NULL DEFAULT false;

-- clients: campos de perfil e preferências
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "clientNumber" INTEGER;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "cpf" TEXT;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "favoriteProfessionalId" TEXT;
