import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    credentials: true,
  })

  const fastify = app.getHttpAdapter().getInstance()
  fastify.get('/api/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

  app.setGlobalPrefix('api/v1')

  const port = Number(process.env.PORT ?? process.env.API_PORT) || 3001
  const host = process.env.API_HOST ?? '0.0.0.0'

  await app.listen(port, host)
}

bootstrap()
