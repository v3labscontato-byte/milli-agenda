import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { ComandasService } from './comandas.service'
import { CreateComandaDto } from './dto/create-comanda.dto'
import { AddItemDto } from './dto/add-item.dto'

@UseGuards(JwtAuthGuard)
@Controller('commands')
export class ComandasController {
  constructor(private readonly comandasService: ComandasService) {}

  @Get()
  findAll(
    @TenantFromJwt() tenantId: string,
    @Query('status') status?: string,
    @Query('clientId') clientId?: string,
  ) {
    return this.comandasService.findAll(tenantId, { status, clientId })
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

  @Delete(':id/items/:itemId')
  removeItem(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.comandasService.removeItem(tenantId, id, itemId)
  }

  @Post(':id/discount')
  discount(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body('amount') amount: number,
  ) {
    return this.comandasService.applyDiscount(tenantId, id, amount)
  }

  @Post(':id/close')
  close(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.comandasService.close(tenantId, id)
  }

  @Post(':id/reopen')
  reopen(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.comandasService.reopen(tenantId, id)
  }

  @Patch(':id/cancel')
  cancel(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.comandasService.cancel(tenantId, id)
  }
}
