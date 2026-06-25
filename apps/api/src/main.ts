import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err)
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err)
  process.exit(1)
})

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  )

  app.setGlobalPrefix('api/v1')
  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
  })

  const fastify = app.getHttpAdapter().getInstance()
  fastify.get('/api/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }))

  const port = Number(process.env.PORT ?? process.env.API_PORT) || 3001

  await app.listen(port, '0.0.0.0')
  console.log(`API rodando na porta ${port}`)
}

bootstrap().catch((err) => {
  console.error('Erro ao iniciar:', err)
  process.exit(1)
})
