import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
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

  @Get('commissions')
  commissions(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.relatoriosService.commissions(tenantId, from, to)
  }

  @Get('cashflow')
  cashflow(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.relatoriosService.cashflow(tenantId, from, to)
  }

  @Get('overdue')
  overdue(@TenantFromJwt() tenantId: string) {
    return this.relatoriosService.overdue(tenantId)
  }

  @Post('goals')
  createGoal(
    @TenantFromJwt() tenantId: string,
    @Body() dto: {
      tipo?: string; type?: string
      periodo?: string; period?: string
      valor?: number; value?: number
      dataInicio?: string; startDate?: string
      dataFim?: string; endDate?: string
    },
  ) {
    return this.relatoriosService.createGoal(tenantId, {
      tipo: dto.tipo ?? dto.type ?? '',
      periodo: dto.periodo ?? dto.period ?? '',
      valor: dto.valor ?? dto.value ?? 0,
      dataInicio: dto.dataInicio ?? dto.startDate ?? '',
      dataFim: dto.dataFim ?? dto.endDate ?? '',
    })
  }

  @Get('goals')
  listGoals(@TenantFromJwt() tenantId: string) {
    return this.relatoriosService.listGoals(tenantId)
  }

  @Delete('goals/:id')
  deleteGoal(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.relatoriosService.deleteGoal(tenantId, id)
  }
}
