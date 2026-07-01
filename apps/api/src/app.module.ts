import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'

import { DatabaseModule } from './infra/database/database.module'

import { AuthModule } from './modules/auth/auth.module'
import { AgendaModule } from './modules/agenda/agenda.module'
import { ClientesModule } from './modules/clientes/clientes.module'
import { ProfissionaisModule } from './modules/profissionais/profissionais.module'
import { ServicosModule } from './modules/servicos/servicos.module'
import { ComandasModule } from './modules/comandas/comandas.module'
import { PagamentosModule } from './modules/pagamentos/pagamentos.module'
import { RelatoriosModule } from './modules/relatorios/relatorios.module'
import { SettingsModule } from './modules/settings/settings.module'
import { TemplateEngineModule } from './modules/template-engine/template-engine.module'
import { ProdutosModule } from './modules/produtos/produtos.module'
import { PublicModule } from './modules/public/public.module'
import { UploadModule } from './modules/upload/upload.module'

import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    AgendaModule,
    ClientesModule,
    ProfissionaisModule,
    ServicosModule,
    ComandasModule,
    PagamentosModule,
    RelatoriosModule,
    SettingsModule,
    TemplateEngineModule,
    ProdutosModule,
    PublicModule,
    UploadModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
