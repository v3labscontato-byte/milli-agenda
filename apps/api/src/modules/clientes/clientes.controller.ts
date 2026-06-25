import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { ClientesService } from './clientes.service'
import { CreateClienteDto } from './dto/create-cliente.dto'

@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Get()
  findAll(@TenantFromJwt() tenantId: string) {
    return this.clientesService.findAll(tenantId)
  }

  @Get(':id')
  findOne(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.clientesService.findOne(tenantId, id)
  }

  @Get(':id/historico')
  historico(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.clientesService.historico(tenantId, id)
  }

  @Post()
  create(@TenantFromJwt() tenantId: string, @Body() dto: CreateClienteDto) {
    return this.clientesService.create(tenantId, dto)
  }

  @Patch(':id')
  update(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateClienteDto>,
  ) {
    return this.clientesService.update(tenantId, id, dto)
  }

  @Delete(':id')
  remove(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.clientesService.remove(tenantId, id)
  }
}
