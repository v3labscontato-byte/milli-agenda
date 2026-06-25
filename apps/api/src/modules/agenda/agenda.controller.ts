import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { AgendaService } from './agenda.service'
import { CreateAppointmentDto } from './dto/create-appointment.dto'
import { TransitionStatusDto } from './dto/transition-status.dto'

@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  findAll(
    @TenantFromJwt() tenantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('professionalId') professionalId?: string,
    @Query('status') status?: string,
  ) {
    return this.agendaService.findAll(tenantId, { from, to, professionalId, status })
  }

  @Get(':id')
  findOne(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.agendaService.findOne(tenantId, id)
  }

  @Post()
  create(@TenantFromJwt() tenantId: string, @Body() dto: CreateAppointmentDto) {
    return this.agendaService.create(tenantId, dto)
  }

  @Patch(':id')
  update(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateAppointmentDto>,
  ) {
    return this.agendaService.update(tenantId, id, dto)
  }

  @Patch(':id/status')
  transition(
    @TenantFromJwt() tenantId: string,
    @Param('id') id: string,
    @Body() dto: TransitionStatusDto,
  ) {
    return this.agendaService.transition(tenantId, id, dto.status)
  }

  @Delete(':id')
  remove(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.agendaService.remove(tenantId, id)
  }
}
