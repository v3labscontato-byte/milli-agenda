import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
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

  @Post('commissions/:professionalId/pay')
  payCommission(
    @TenantFromJwt() tenantId: string,
    @Param('professionalId') professionalId: string,
    @Body() dto: { period: string; amount: number },
  ) {
    return this.relatoriosService.payCommission(tenantId, professionalId, dto)
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

  @Get('payments-by-method')
  paymentsByMethod(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.relatoriosService.paymentsByMethod(tenantId, from, to)
  }

  @Get('top-services')
  topServices(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.relatoriosService.topServices(tenantId, from, to)
  }

  @Get('payments')
  listPayments(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.relatoriosService.listPayments(tenantId, from, to)
  }

  @Post('expenses')
  createExpense(
    @TenantFromJwt() tenantId: string,
    @Body() dto: { descricao: string; valor: number; data: string },
  ) {
    return this.relatoriosService.createExpense(tenantId, dto)
  }

  @Get('chart-of-accounts')
  listChartOfAccounts(
    @TenantFromJwt() tenantId: string,
    @Query('period') period?: string,
  ) {
    return this.relatoriosService.listChartOfAccounts(tenantId, period)
  }

  @Post('chart-of-accounts')
  createChartOfAccount(
    @TenantFromJwt() tenantId: string,
    @Body() dto: { nome: string; tipo: string; categoria: string; valorPadrao?: number; diaPagamento?: number; recorrente?: boolean; ativa?: boolean },
  ) {
    return this.relatoriosService.createChartOfAccount(tenantId, dto)
  }

  @Delete('chart-of-accounts/:id')
  deleteChartOfAccount(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.relatoriosService.deleteChartOfAccount(tenantId, id)
  }

  @Post('chart-of-accounts/:id/pay')
  payChartOfAccountEntry(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { period: string; valor: number },
  ) {
    return this.relatoriosService.payChartOfAccountEntry(tenantId, id, dto)
  }

  @Post('goals')
  createGoal(
    @TenantFromJwt() tenantId: string,
    @Body() dto: { tipo: string; periodo: string; valor: number; dataInicio: string; dataFim: string },
  ) {
    return this.relatoriosService.createGoal(tenantId, dto)
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
