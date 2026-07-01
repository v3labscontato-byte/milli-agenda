import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

const NOMES = [
  'Ana Silva', 'Maria Santos', 'Juliana Costa', 'Fernanda Oliveira', 'Patricia Lima',
  'Camila Souza', 'Beatriz Alves', 'Larissa Ferreira', 'Vanessa Rodrigues', 'Amanda Martins',
  'Gabriela Pereira', 'Leticia Barbosa', 'Isabela Carvalho', 'Rafaela Nascimento', 'Mariana Ribeiro',
  'Carolina Gomes', 'Aline Araujo', 'Tatiana Dias', 'Renata Cardoso', 'Priscila Moreira',
  'Luciana Castro', 'Daniela Pinto', 'Cristina Monteiro', 'Sandra Nunes', 'Claudia Teixeira',
  'Roberta Vieira', 'Simone Mendes', 'Elaine Freitas', 'Adriana Cavalcante', 'Viviane Correia',
  'Carlos Silva', 'Joao Santos', 'Pedro Costa', 'Lucas Oliveira', 'Bruno Lima',
  'Diego Souza', 'Rafael Alves', 'Thiago Ferreira', 'Rodrigo Rodrigues', 'Gustavo Martins',
  'Felipe Pereira', 'Eduardo Barbosa', 'Mateus Carvalho', 'Leonardo Nascimento', 'Vinicius Ribeiro',
  'Marcelo Gomes', 'Anderson Araujo', 'Fabio Dias', 'Ricardo Cardoso', 'Alexandre Moreira',
]

const PAYMENT_METHODS = ['PIX', 'CREDIT_CARD', 'CASH'] as const

function randomMethod() {
  return PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)]
}

async function main() {
  const tenant = await db.tenant.findUnique({ where: { slug: 'studio-homolog' } })
  if (!tenant) throw new Error('Tenant studio-homolog nao encontrado — rode seed-homolog.ts primeiro')

  const services = await db.service.findMany({ where: { tenantId: tenant.id, active: true } })
  if (services.length === 0) throw new Error('Nenhum servico encontrado — rode seed-homolog.ts primeiro')

  // 50 CLIENTES
  console.log('Criando 50 clientes...')
  const clientes = []
  for (let i = 0; i < 50; i++) {
    const nome = NOMES[i]
    const tel = `119${String(90000000 + i).padStart(8, '0')}`
    const hasEmail = i % 3 !== 0
    const c = await db.client.upsert({
      where: { tenantId_phone: { tenantId: tenant.id, phone: tel } },
      update: {},
      create: {
        name: nome,
        phone: tel,
        email: hasEmail ? `${nome.toLowerCase().replace(/\s+/g, '.')}${i}@email.com` : null,
        tenantId: tenant.id,
      },
    })
    clientes.push(c)
  }
  console.log(`${clientes.length} clientes criados`)

  // 5 PROFISSIONAIS ADICIONAIS
  console.log('Criando 5 profissionais adicionais...')
  const profData = [
    { id: 'prof-homolog-3', name: 'Fernanda Lima',  email: 'fernanda@studiohomolog.com', phone: '11966666666', commissionPct: 45 },
    { id: 'prof-homolog-4', name: 'Roberto Alves',  email: 'roberto@studiohomolog.com',  phone: '11955555555', commissionPct: 40 },
    { id: 'prof-homolog-5', name: 'Camila Souza',   email: 'camila@studiohomolog.com',   phone: '11944444444', commissionPct: 50 },
    { id: 'prof-homolog-6', name: 'Diego Martins',  email: 'diego@studiohomolog.com',    phone: '11933333333', commissionPct: 35 },
    { id: 'prof-homolog-7', name: 'Patricia Costa', email: 'patricia@studiohomolog.com', phone: '11922222222', commissionPct: 45 },
  ]
  for (const p of profData) {
    await db.professional.upsert({
      where: { id: p.id },
      update: {},
      create: {
        ...p,
        tenantId: tenant.id,
        active: true,
        workDays: [1, 2, 3, 4, 5, 6],
        workStart: '09:00',
        workEnd: '19:00',
        enabledServices: services.map((s) => s.id),
      },
    })
  }
  console.log(`${profData.length} profissionais adicionais criados`)

  // 5 PRODUTOS
  console.log('Criando 5 produtos...')
  const produtosData = [
    { id: 'prod-homolog-1', name: 'Shampoo Profissional',    price: 45.00, stockQuantity: 20, sku: 'shampoo-prof' },
    { id: 'prod-homolog-2', name: 'Condicionador Hidratacao', price: 38.00, stockQuantity: 15, sku: 'cond-hidrat'  },
    { id: 'prod-homolog-3', name: 'Mascara Capilar',          price: 65.00, stockQuantity: 10, sku: 'masc-cap'     },
    { id: 'prod-homolog-4', name: 'Tinta Louro Dourado',      price: 28.00, stockQuantity: 30, sku: 'tinta-louro'  },
    { id: 'prod-homolog-5', name: 'Finalizador Brilho',       price: 52.00, stockQuantity: 12, sku: 'fin-brilho'   },
  ]
  for (const p of produtosData) {
    await db.product.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        stockQuantity: p.stockQuantity,
        tenantId: tenant.id,
        active: true,
        classifications: ['RESALE'],
      },
    })
  }
  console.log('5 produtos criados')

  // AGENDAMENTOS — busca todos os profissionais ativos
  const todosProfissionais = await db.professional.findMany({
    where: { tenantId: tenant.id, active: true },
  })
  console.log(`Criando ~5 agendamentos para cada um dos ${todosProfissionais.length} profissionais...`)

  let totalAgendamentos = 0
  const now = new Date()

  for (const prof of todosProfissionais) {
    for (let i = 0; i < 5; i++) {
      const daysAgo = Math.floor(Math.random() * 60)
      const startAt = new Date(now)
      startAt.setDate(startAt.getDate() - daysAgo)
      startAt.setHours(9 + Math.floor(Math.random() * 9), [0, 30][Math.floor(Math.random() * 2)], 0, 0)

      const service = services[Math.floor(Math.random() * services.length)]
      const cliente = clientes[Math.floor(Math.random() * clientes.length)]

      const endAt = new Date(startAt)
      endAt.setMinutes(endAt.getMinutes() + (service.durationMin ?? 60))

      const rand = Math.random()
      const status = rand < 0.7 ? 'COMPLETED' : rand < 0.9 ? 'CONFIRMED' : 'CANCELLED'

      if (status === 'COMPLETED') {
        // Criar comanda FECHADA primeiro, depois agendamento com commandId
        const command = await db.command.create({
          data: {
            tenantId: tenant.id,
            clientId: cliente.id,
            status: 'CLOSED',
            totalAmount: service.price,
            discountAmount: 0,
            finalAmount: service.price,
            closedAt: endAt,
            items: {
              create: {
                serviceId: service.id,
                quantity: 1,
                unitPrice: service.price,
                discount: 0,
                total: service.price,
              },
            },
            payments: {
              create: {
                tenantId: tenant.id,
                method: randomMethod(),
                status: 'PAID',
                amount: service.price,
                paidAt: endAt,
              },
            },
          },
        })

        await db.appointment.create({
          data: {
            tenantId: tenant.id,
            clientId: cliente.id,
            professionalId: prof.id,
            serviceId: service.id,
            commandId: command.id,
            startAt,
            endAt,
            status: 'COMPLETED',
          },
        })
      } else {
        await db.appointment.create({
          data: {
            tenantId: tenant.id,
            clientId: cliente.id,
            professionalId: prof.id,
            serviceId: service.id,
            startAt,
            endAt,
            status,
          },
        })
      }

      totalAgendamentos++
    }
  }

  console.log(`${totalAgendamentos} agendamentos criados`)
  console.log('Seed de dados completo!')
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
