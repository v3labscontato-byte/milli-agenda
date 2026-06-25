import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { PagamentosService } from './pagamentos.service'
import { CreatePagamentoDto } from './dto/create-pagamento.dto'

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Get()
  findAll(
    @TenantFromJwt() tenantId: string,
    @Query('commandId') commandId?: string,
  ) {
    return this.pagamentosService.findAll(tenantId, commandId)
  }

  @Post()
  receive(@TenantFromJwt() tenantId: string, @Body() dto: CreatePagamentoDto) {
    return this.pagamentosService.receive(tenantId, dto)
  }

  @Patch(':id/refund')
  refund(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.pagamentosService.refund(tenantId, id)
  }
}
