import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { RelatoriosService } from './relatorios.service'

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class RelatoriosController {
  constructor(private readonly relatoriosService: RelatoriosService) {}

  @Get('kpis')
  kpis(@TenantFromJwt() tenantId: string, @Query('date') date?: string) {
    return this.relatoriosService.kpis(tenantId, date)
  }

  @Get('revenue')
  revenue(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.relatoriosService.receita(tenantId, from, to)
  }

  @Get('appointments')
  appointments(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.relatoriosService.ocupacao(tenantId, from, to)
  }

  @Get('professionals')
  professionals(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.relatoriosService.professionals(tenantId, from, to)
  }
}
