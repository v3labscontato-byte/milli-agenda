import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { execFile } from 'child_process'
import { join } from 'path'

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); process.exit(1) })
process.on('unhandledRejection', (err) => { console.error('UNHANDLED REJECTION:', err); process.exit(1) })

// Migrations that were already applied via prisma db push (not via migrate).
// We mark them as --applied so Prisma doesn't try to re-run them,
// then migrate deploy only runs NEW pending migrations (e.g. add_goals).
const ALREADY_APPLIED_MIGRATIONS = [
  '20260625000000_init',
  '20260625010000_add_password_reset_token',
  '20260625020000_add_onboarding_models',
]

function runMigrations(): Promise<void> {
  const schemaPath = join(__dirname, '..', '..', '..', 'packages', 'database', 'prisma', 'schema.prisma')
  const prismaBin = join(__dirname, '..', '..', '..', 'node_modules', '.bin', 'prisma')

  const resolve_applied = (name: string) => new Promise<void>((res) => {
    execFile(prismaBin, ['migrate', 'resolve', '--applied', name, '--schema', schemaPath],
      { timeout: 15_000 }, () => res())
  })

  const deploy = () => new Promise<void>((res) => {
    execFile(prismaBin, ['migrate', 'deploy', '--schema', schemaPath],
      { timeout: 30_000 }, (err, stdout, stderr) => {
        if (err) console.warn('migrate deploy:', err.message.slice(0, 200))
        else console.log('Migrations:', stdout?.trim() || 'up to date')
        if (stderr) console.warn(stderr.slice(0, 200))
        res()
      })
  })

  return (async () => {
    for (const m of ALREADY_APPLIED_MIGRATIONS) await resolve_applied(m)
    await deploy()
  })()
}

async function bootstrap() {
  await runMigrations()
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter())

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.setGlobalPrefix('api/v1')
  app.enableCors({ origin: process.env.CORS_ORIGIN || '*' })

  const fastify = app.getHttpAdapter().getInstance()
  const healthHandler = async () => ({ status: 'ok', timestamp: new Date().toISOString() })
  fastify.get('/api/health', healthHandler)
  fastify.get('/api/v1/health', healthHandler)

  const port = Number(process.env.PORT) || 3001
  await app.listen(port, '0.0.0.0')
  console.log(`API rodando na porta ${port}`)
}

bootstrap().catch((err) => { console.error('Erro ao iniciar:', err); process.exit(1) })
