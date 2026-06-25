import { PrismaClient, Prisma } from '@prisma/client'
const db = new PrismaClient()

const TEMPLATES = [
  {
    slug: 'salao-de-beleza',
    name: 'Salão de Beleza',
    icon: 'scissors',
    description: 'Cortes, coloração, unhas e muito mais',
    order: 0,
    roles: ['Cabeleireiro', 'Colorista', 'Manicure', 'Pedicure', 'Esteticista', 'Recepcionista'],
    categories: [
      { name: 'Cabelo', color: '#7C3AED', services: [
        { name: 'Corte Feminino', duration: 60, price: new Prisma.Decimal('80.00') },
        { name: 'Corte Masculino', duration: 30, price: new Prisma.Decimal('50.00') },
        { name: 'Escova', duration: 45, price: new Prisma.Decimal('70.00') },
        { name: 'Progressiva', duration: 120, price: new Prisma.Decimal('200.00') },
        { name: 'Coloração', duration: 90, price: new Prisma.Decimal('150.00') },
        { name: 'Mechas', duration: 120, price: new Prisma.Decimal('180.00') },
      ]},
      { name: 'Unhas', color: '#DB2777', services: [
        { name: 'Manicure', duration: 45, price: new Prisma.Decimal('45.00') },
        { name: 'Pedicure', duration: 50, price: new Prisma.Decimal('55.00') },
      ]},
      { name: 'Sobrancelhas', color: '#059669', services: [
        { name: 'Design de Sobrancelhas', duration: 30, price: new Prisma.Decimal('35.00') },
      ]},
      { name: 'Estética', color: '#D97706', services: [] },
      { name: 'Maquiagem', color: '#DC2626', services: [] },
    ],
  },
  {
    slug: 'barbearia',
    name: 'Barbearia',
    icon: 'scissors',
    description: 'Cortes masculinos, barba e cuidados masculinos',
    order: 1,
    roles: ['Barbeiro', 'Barbeiro Senior', 'Recepcionista'],
    categories: [
      { name: 'Cabelo', color: '#2563EB', services: [
        { name: 'Corte Masculino', duration: 30, price: new Prisma.Decimal('45.00') },
        { name: 'Pigmentação', duration: 60, price: new Prisma.Decimal('80.00') },
        { name: 'Hidratação', duration: 40, price: new Prisma.Decimal('60.00') },
      ]},
      { name: 'Barba', color: '#7C3AED', services: [
        { name: 'Barba', duration: 30, price: new Prisma.Decimal('35.00') },
        { name: 'Sobrancelha', duration: 20, price: new Prisma.Decimal('25.00') },
      ]},
      { name: 'Combo', color: '#059669', services: [
        { name: 'Corte + Barba', duration: 50, price: new Prisma.Decimal('70.00') },
      ]},
    ],
  },
  {
    slug: 'clinica-estetica',
    name: 'Clínica Estética',
    icon: 'sparkles',
    description: 'Procedimentos estéticos faciais e corporais',
    order: 2,
    roles: ['Esteticista', 'Biomédico', 'Massoterapeuta', 'Recepcionista'],
    categories: [
      { name: 'Rosto', color: '#DB2777', services: [
        { name: 'Limpeza de Pele', duration: 60, price: new Prisma.Decimal('120.00') },
        { name: 'Peeling', duration: 60, price: new Prisma.Decimal('150.00') },
        { name: 'Botox', duration: 30, price: new Prisma.Decimal('300.00') },
        { name: 'Preenchimento', duration: 45, price: new Prisma.Decimal('400.00') },
      ]},
      { name: 'Corpo', color: '#7C3AED', services: [
        { name: 'Drenagem Linfática', duration: 60, price: new Prisma.Decimal('130.00') },
      ]},
      { name: 'Depilação', color: '#D97706', services: [
        { name: 'Depilação Axila', duration: 20, price: new Prisma.Decimal('45.00') },
        { name: 'Depilação Perna', duration: 45, price: new Prisma.Decimal('120.00') },
      ]},
      { name: 'Massagem', color: '#059669', services: [
        { name: 'Massagem Relaxante', duration: 60, price: new Prisma.Decimal('130.00') },
      ]},
    ],
  },
  {
    slug: 'outros',
    name: 'Outro Segmento',
    icon: 'help-circle',
    description: 'Configure seu negócio do zero',
    order: 3,
    roles: ['Profissional', 'Recepcionista'],
    categories: [
      { name: 'Serviços', color: '#475569', services: [] },
    ],
  },
]

async function main() {
  console.log('Seeding nicho templates...')
  for (const tpl of TEMPLATES) {
    await db.nichoTemplate.upsert({
      where: { slug: tpl.slug },
      update: {},
      create: {
        slug: tpl.slug,
        name: tpl.name,
        icon: tpl.icon,
        description: tpl.description,
        order: tpl.order,
        roles: {
          create: tpl.roles.map((name, i) => ({ name, order: i })),
        },
        categories: {
          create: tpl.categories.map((cat, catIdx) => ({
            name: cat.name,
            color: cat.color,
            order: catIdx,
            services: {
              create: cat.services.map((svc, svcIdx) => ({
                name: svc.name,
                duration: svc.duration,
                price: svc.price,
                order: svcIdx,
                nicho: { connect: { slug: tpl.slug } },
              })),
            },
          })),
        },
      },
    })
    console.log(`  ✓ ${tpl.name}`)
  }
  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
