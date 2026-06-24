import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { ServicosService } from './servicos.service'
import { CreateServicoDto } from './dto/create-servico.dto'

@UseGuards(JwtAuthGuard)
@Controller('servicos')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  @Get()
  findAll(@TenantFromJwt() tenantId: string) {
    return this.servicosService.findAll(tenantId)
  }

  @Get(':id')
  findOne(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.servicosService.findOne(tenantId, id)
  }

  @Post()
  create(@TenantFromJwt() tenantId: string, @Body() dto: CreateServicoDto) {
    return this.servicosService.create(tenantId, dto)
  }

  @Patch(':id')
  update(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateServicoDto>,
  ) {
    return this.servicosService.update(tenantId, id, dto)
  }

  @Delete(':id')
  remove(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.servicosService.remove(tenantId, id)
  }
}
