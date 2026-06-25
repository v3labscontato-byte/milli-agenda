import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { ProfissionaisService } from './profissionais.service'
import { CreateProfissionalDto } from './dto/create-profissional.dto'

@UseGuards(JwtAuthGuard)
@Controller('professionals')
export class ProfissionaisController {
  constructor(private readonly profissionaisService: ProfissionaisService) {}

  @Get()
  findAll(@TenantFromJwt() tenantId: string) {
    return this.profissionaisService.findAll(tenantId)
  }

  @Get('roles')
  getRoles(@TenantFromJwt() tenantId: string) {
    return this.profissionaisService.getRoles(tenantId)
  }

  @Post('roles')
  createRole(@TenantFromJwt() tenantId: string, @Body() dto: { name: string; description?: string }) {
    return this.profissionaisService.createRole(tenantId, dto)
  }

  @Patch('roles/:id')
  updateRole(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: { name?: string; description?: string; order?: number },
  ) {
    return this.profissionaisService.updateRole(tenantId, id, dto)
  }

  @Delete('roles/:id')
  deleteRole(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.profissionaisService.deleteRole(tenantId, id)
  }

  @Get(':id')
  findOne(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.profissionaisService.findOne(tenantId, id)
  }

  @Get(':id/disponibilidade')
  disponibilidade(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('durationMin') durationMin: string,
  ) {
    return this.profissionaisService.disponibilidade(tenantId, id, date, Number(durationMin))
  }

  @Post()
  create(@TenantFromJwt() tenantId: string, @Body() dto: CreateProfissionalDto) {
    return this.profissionaisService.create(tenantId, dto)
  }

  @Patch(':id')
  update(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateProfissionalDto>,
  ) {
    return this.profissionaisService.update(tenantId, id, dto)
  }

  @Delete(':id')
  remove(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.profissionaisService.remove(tenantId, id)
  }
}
