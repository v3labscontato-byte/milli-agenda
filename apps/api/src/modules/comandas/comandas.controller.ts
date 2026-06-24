import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { ComandasService } from './comandas.service'
import { CreateComandaDto } from './dto/create-comanda.dto'
import { AddItemDto } from './dto/add-item.dto'

@UseGuards(JwtAuthGuard)
@Controller('comandas')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Get()
  findAll(@TenantFromJwt() tenantId: string) {
    return this.comandasService.findAll(tenantId)
  }

  @Get(':id')
  findOne(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.comandasService.findOne(tenantId, id)
  }

  @Post()
  open(@TenantFromJwt() tenantId: string, @Body() dto: CreateComandaDto) {
    return this.comandasService.open(tenantId, dto)
  }

  @Post(':id/items')
  addItem(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: AddItemDto,
  ) {
    return this.comandasService.addItem(tenantId, id, dto)
  }

  @Patch(':id/close')
  close(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.comandasService.close(tenantId, id)
  }

  @Patch(':id/cancel')
  cancel(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.comandasService.cancel(tenantId, id)
  }
}
