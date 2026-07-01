import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { RelatoriosService } from './relatorios.service'

function parsePeriod(period?: string, from?: string, to?: string): { from?: string; to?: string } {
  if (!period) return { from, to }
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  const toStr = fmt(now)
  if (period === '7d') {
    const d = new Date(now); d.setDate(d.getDate() - 7)
    return { from: fmt(d), to: toStr }
  }
  if (period === '30d') {
    const d = new Date(now); d.setDate(d.getDate() - 30)
    return { from: fmt(d), to: toStr }
  }
  if (period === '90d') {
    const d = new Date(now); d.setDate(d.getDate() - 90)
    return { from: fmt(d), to: toStr }
  }
  if (period === 'este-mes') {
    return { from: fmt(new Date(now.getFullYear(), now.getMonth(), 1)), to: toStr }
  }
  return { from, to }
}

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
    @Query('period') period?: string,
  ) {
    const range = parsePeriod(period, from, to)
    return this.relatoriosService.receita(tenantId, range.from, range.to)
  }

  @Get('appointments')
  appointments(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('period') period?: string,
  ) {
    const range = parsePeriod(period, from, to)
    return this.relatoriosService.ocupacao(tenantId, range.from, range.to)
  }

  @Get('professionals')
  professionals(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('period') period?: string,
  ) {
    const range = parsePeriod(period, from, to)
    return this.relatoriosService.professionals(tenantId, range.from, range.to)
  }

  @Get('commissions')
  commissions(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('period') period?: string,
  ) {
    const range = parsePeriod(period, from, to)
    return this.relatoriosService.commissions(tenantId, range.from, range.to)
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
    @Query('period') period?: string,
  ) {
    const range = parsePeriod(period, from, to)
    return this.relatoriosService.cashflow(tenantId, range.from, range.to)
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
    @Query('period') period?: string,
  ) {
    const range = parsePeriod(period, from, to)
    return this.relatoriosService.paymentsByMethod(tenantId, range.from, range.to)
  }

  @Get('top-services')
  topServices(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('period') period?: string,
  ) {
    const range = parsePeriod(period, from, to)
    return this.relatoriosService.topServices(tenantId, range.from, range.to)
  }

  @Get('payments')
  listPayments(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('period') period?: string,
  ) {
    const range = parsePeriod(period, from, to)
    return this.relatoriosService.listPayments(tenantId, range.from, range.to)
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
