-- AlterTable Tenant (onboarding fields)
ALTER TABLE "tenants" ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "tenants" ADD COLUMN "nichoSlug" TEXT;

-- AlterTable Service (category FK)
ALTER TABLE "services" ADD COLUMN "categoryId" TEXT;

-- CreateTable NichoTemplate
CREATE TABLE "nicho_templates" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nicho_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nicho_templates_slug_key" ON "nicho_templates"("slug");

-- CreateTable NichoTemplateRole
CREATE TABLE "nicho_template_roles" (
    "id" TEXT NOT NULL,
    "nichoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "nicho_template_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable NichoTemplateCategory
CREATE TABLE "nicho_template_categories" (
    "id" TEXT NOT NULL,
    "nichoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#2563EB',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "nicho_template_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable NichoTemplateService
CREATE TABLE "nicho_template_services" (
    "id" TEXT NOT NULL,
    "nichoId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "nicho_template_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable ProfessionalRole
CREATE TABLE "professional_roles" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professional_roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "professional_roles_tenantId_idx" ON "professional_roles"("tenantId");

-- CreateTable ServiceCategory
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#2563EB',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_categories_tenantId_idx" ON "service_categories"("tenantId");

-- AddForeignKey
ALTER TABLE "nicho_template_roles" ADD CONSTRAINT "nicho_template_roles_nichoId_fkey" FOREIGN KEY ("nichoId") REFERENCES "nicho_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicho_template_categories" ADD CONSTRAINT "nicho_template_categories_nichoId_fkey" FOREIGN KEY ("nichoId") REFERENCES "nicho_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicho_template_services" ADD CONSTRAINT "nicho_template_services_nichoId_fkey" FOREIGN KEY ("nichoId") REFERENCES "nicho_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nicho_template_services" ADD CONSTRAINT "nicho_template_services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "nicho_template_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "professional_roles" ADD CONSTRAINT "professional_roles_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
