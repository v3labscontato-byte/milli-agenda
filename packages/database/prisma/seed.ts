import { PrismaClient, UserRole, PlanSlug } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'bella-vista' },
    update: {},
    create: {
      name: 'Salão Bella Vista',
      slug: 'bella-vista',
      plan: PlanSlug.PROFESSIONAL,
      phone: '(11) 99999-0000',
      email: 'contato@bellavista.com',
      active: true,
    },
  })

  // Roles
  for (const name of ['OWNER', 'ADMIN', 'MANAGER', 'ATTENDANT', 'PROFESSIONAL']) {
    await prisma.role.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name } },
      update: {},
      create: { tenantId: tenant.id, name },
    })
  }

  // Permissions
  for (const resource of ['clients', 'professionals', 'services', 'appointments', 'commands', 'payments', 'reports', 'settings']) {
    for (const action of ['read', 'write', 'delete']) {
      await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action, description: `${action} ${resource}` },
      })
    }
  }

  // Admin user
  const passwordHash = await bcrypt.hash('Admin@123', 12)
  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@bellavista.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@bellavista.com',
      name: 'Administrador',
      passwordHash,
      role: UserRole.TENANT_ADMIN,
      active: true,
    },
  })
  console.log('Admin:', adminUser.email)

  // Professionals
  const profData = [
    { name: 'Lisa Kim',   email: 'lisa@bellavista.com',  specialty: 'Cabelo',   commissionPct: 40 },
    { name: 'Joao Silva', email: 'joao@bellavista.com',  specialty: 'Barba',    commissionPct: 35 },
    { name: 'Ana Costa',  email: 'ana@bellavista.com',   specialty: 'Unhas',    commissionPct: 40 },
    { name: 'Lena Souza', email: 'lena@bellavista.com',  specialty: 'Estetica', commissionPct: 38 },
  ]
  const professionals: { id: string; name: string }[] = []
  for (const p of profData) {
    let prof = await prisma.professional.findFirst({ where: { tenantId: tenant.id, name: p.name } })
    if (!prof) prof = await prisma.professional.create({ data: { tenantId: tenant.id, ...p } })
    professionals.push(prof)
  }

  // Services
  const serviceData = [
    { name: 'Corte Feminino',  durationMin: 60,  price: 80  },
    { name: 'Corte Masculino', durationMin: 30,  price: 45  },
    { name: 'Escova',          durationMin: 60,  price: 70  },
    { name: 'Coloracao',       durationMin: 120, price: 180 },
    { name: 'Mechas',          durationMin: 150, price: 250 },
    { name: 'Manicure',        durationMin: 60,  price: 40  },
    { name: 'Pedicure',        durationMin: 60,  price: 50  },
    { name: 'Hidratacao',      durationMin: 60,  price: 90  },
    { name: 'Barba',           durationMin: 30,  price: 35  },
    { name: 'Sobrancelha',     durationMin: 20,  price: 30  },
  ]
  const services: { id: string; name: string }[] = []
  for (const s of serviceData) {
    let svc = await prisma.service.findFirst({ where: { tenantId: tenant.id, name: s.name } })
    if (!svc) svc = await prisma.service.create({ data: { tenantId: tenant.id, ...s, active: true } })
    services.push(svc)
  }

  // Clients
  const clientData = [
    { name: 'Ana Paula Silva',   phone: '11991110001' },
    { name: 'Beatriz Santos',    phone: '11991110002' },
    { name: 'Carla Mendes',      phone: '11991110003' },
    { name: 'Daniela Costa',     phone: '11991110004' },
    { name: 'Elisa Ferreira',    phone: '11991110005' },
    { name: 'Fernanda Oliveira', phone: '11991110006' },
    { name: 'Gabriela Lima',     phone: '11991110007' },
    { name: 'Helena Rodrigues',  phone: '11991110008' },
    { name: 'Isabela Pereira',   phone: '11991110009' },
    { name: 'Juliana Alves',     phone: '11991110010' },
    { name: 'Karina Sousa',      phone: '11991110011' },
    { name: 'Laura Nascimento',  phone: '11991110012' },
    { name: 'Mariana Carvalho',  phone: '11991110013' },
    { name: 'Natalia Gomes',     phone: '11991110014' },
    { name: 'Olivia Martins',    phone: '11991110015' },
    { name: 'Patricia Barbosa',  phone: '11991110016' },
    { name: 'Queila Ribeiro',    phone: '11991110017' },
    { name: 'Renata Castro',     phone: '11991110018' },
    { name: 'Sabrina Teixeira',  phone: '11991110019' },
    { name: 'Tatiana Monteiro',  phone: '11991110020' },
  ]
  const clients: { id: string; name: string }[] = []
  for (const c of clientData) {
    let cl = await prisma.client.findFirst({ where: { tenantId: tenant.id, phone: c.phone } })
    if (!cl) cl = await prisma.client.create({ data: { tenantId: tenant.id, ...c } })
    clients.push(cl)
  }

  // Appointments
  const statusCycle = [
    'SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'IN_SERVICE',
    'AWAITING_PAYMENT', 'COMPLETED', 'COMPLETED', 'NO_SHOW',
  ] as const
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let apptCount = 0
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - Math.floor(i / 4))
    d.setHours(9 + (i % 9), 0, 0, 0)
    const endAt = new Date(d)
    endAt.setMinutes(endAt.getMinutes() + 60)

    const cl   = clients[i % clients.length]
    const prof = professionals[i % professionals.length]
    const svc  = services[i % services.length]
    const status = statusCycle[i % statusCycle.length]

    const existing = await prisma.appointment.findFirst({
      where: { tenantId: tenant.id, clientId: cl.id, startAt: d },
    })
    if (!existing) {
      await prisma.appointment.create({
        data: { tenantId: tenant.id, clientId: cl.id, professionalId: prof.id, serviceId: svc.id, startAt: d, endAt, status },
      })
      apptCount++
    }
  }

  console.log('Seed complete!')
  console.log('  Tenant: bella-vista')
  console.log('  Login : admin@bellavista.com / Admin@123')
  console.log('  Appointments created:', apptCount)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
