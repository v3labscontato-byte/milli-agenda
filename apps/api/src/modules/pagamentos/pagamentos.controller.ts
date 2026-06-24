import { Controller, Post, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { PagamentosService } from './pagamentos.service'
import { CreatePagamentoDto } from './dto/create-pagamento.dto'

@UseGuards(JwtAuthGuard)
@Controller('pagamentos')
export class PagamentosController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @Post()
  receive(@TenantFromJwt() tenantId: string, @Body() dto: CreatePagamentoDto) {
    return this.pagamentosService.receive(tenantId, dto)
  }

  @Patch(':id/estorno')
  refund(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.pagamentosService.refund(tenantId, id)
  }
}
