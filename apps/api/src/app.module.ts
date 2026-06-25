import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

import { DatabaseModule } from './infra/database/database.module'
import { CacheModule } from './infra/cache/cache.module'

import { AuthModule } from './modules/auth/auth.module'
import { AgendaModule } from './modules/agenda/agenda.module'
import { ClientesModule } from './modules/clientes/clientes.module'
import { ProfissionaisModule } from './modules/profissionais/profissionais.module'
import { ServicosModule } from './modules/servicos/servicos.module'
import { ComandasModule } from './modules/comandas/comandas.module'
import { PagamentosModule } from './modules/pagamentos/pagamentos.module'
import { RelatoriosModule } from './modules/relatorios/relatorios.module'

import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { TenantMiddleware } from './common/middleware/tenant.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '../../.env' }),
    DatabaseModule,
    CacheModule,
    AuthModule,
    AgendaModule,
    ClientesModule,
    ProfissionaisModule,
    ServicosModule,
    ComandasModule,
    PagamentosModule,
    RelatoriosModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*')
  }
}
