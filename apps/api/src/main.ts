import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'

process.on('uncaughtException', (err) => { console.error('UNCAUGHT EXCEPTION:', err); process.exit(1) })
process.on('unhandledRejection', (err) => { console.error('UNHANDLED REJECTION:', err); process.exit(1) })

async function bootstrap() {
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
