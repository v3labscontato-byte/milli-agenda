import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  console.log('Iniciando seed do homolog...')

  const tenant = await db.tenant.upsert({
    where: { slug: 'studio-homolog' },
    update: {},
    create: {
      slug: 'studio-homolog',
      name: 'Studio Homolog',
      email: 'contato@studiohomolog.com',
      phone: '11999999999',
      city: 'São Paulo',
      state: 'SP',
      primaryColor: '#81736f',
      businessHours: {
        seg: { open: '09:00', close: '19:00', active: true },
        ter: { open: '09:00', close: '19:00', active: true },
        qua: { open: '09:00', close: '19:00', active: true },
        qui: { open: '09:00', close: '19:00', active: true },
        sex: { open: '09:00', close: '19:00', active: true },
        sab: { open: '09:00', close: '14:00', active: true },
        dom: { open: '00:00', close: '00:00', active: false },
      },
      acceptedPaymentMethods: ['PIX', 'CASH', 'CREDIT_CARD', 'DEBIT_CARD'],
      slotGapMinutes: 30,
      minAdvanceHours: 1,
      maxAdvanceDays: 30,
    },
  })
  console.log('Tenant criado:', tenant.slug)

  const passwordHash = await bcrypt.hash('123456789', 10)
  const user = await db.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'ddpobre@gmail.com' } },
    update: {},
    create: {
      email: 'ddpobre@gmail.com',
      passwordHash,
      name: 'Admin Homolog',
      role: 'TENANT_ADMIN',
      tenantId: tenant.id,
      active: true,
    },
  })
  console.log('User admin criado:', user.email)

  const svcIds = {
    corte: 'svc-homolog-1',
    escova: 'svc-homolog-2',
    coloracao: 'svc-homolog-3',
    manicure: 'svc-homolog-4',
  }

  const services = await Promise.all([
    db.service.upsert({
      where: { id: svcIds.corte },
      update: {},
      create: {
        id: svcIds.corte,
        name: 'Corte Feminino',
        durationMin: 60,
        price: 80,
        tenantId: tenant.id,
        active: true,
      },
    }),
    db.service.upsert({
      where: { id: svcIds.escova },
      update: {},
      create: {
        id: svcIds.escova,
        name: 'Escova',
        durationMin: 45,
        price: 70,
        tenantId: tenant.id,
        active: true,
      },
    }),
    db.service.upsert({
      where: { id: svcIds.coloracao },
      update: {},
      create: {
        id: svcIds.coloracao,
        name: 'Coloração',
        durationMin: 120,
        price: 150,
        tenantId: tenant.id,
        active: true,
      },
    }),
    db.service.upsert({
      where: { id: svcIds.manicure },
      update: {},
      create: {
        id: svcIds.manicure,
        name: 'Manicure',
        durationMin: 60,
        price: 50,
        tenantId: tenant.id,
        active: true,
      },
    }),
  ])
  console.log('Servicos criados:', services.length)

  await db.professional.upsert({
    where: { id: 'prof-homolog-1' },
    update: {},
    create: {
      id: 'prof-homolog-1',
      name: 'Arthur Silva',
      email: 'arthur@studiohomolog.com',
      phone: '11988888888',
      tenantId: tenant.id,
      active: true,
      commissionPct: 40,
      workDays: [1, 2, 3, 4, 5],
      workStart: '09:00',
      workEnd: '19:00',
      enabledServices: [svcIds.corte, svcIds.escova, svcIds.coloracao],
    },
  })

  await db.professional.upsert({
    where: { id: 'prof-homolog-2' },
    update: {},
    create: {
      id: 'prof-homolog-2',
      name: 'Maria Santos',
      email: 'maria@studiohomolog.com',
      phone: '11977777777',
      tenantId: tenant.id,
      active: true,
      commissionPct: 40,
      workDays: [1, 2, 3, 4, 5, 6],
      workStart: '09:00',
      workEnd: '19:00',
      enabledServices: [svcIds.escova, svcIds.manicure],
    },
  })
  console.log('Profissionais criados')

  await db.client.upsert({
    where: { tenantId_phone: { tenantId: tenant.id, phone: '11991560898' } },
    update: {},
    create: {
      name: 'Vilson Carneiro',
      phone: '11991560898',
      email: 'ddpobre@gmail.com',
      tenantId: tenant.id,
    },
  })
  console.log('Cliente criado')

  console.log('Seed concluido!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
