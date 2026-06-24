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
@Controller('agenda')
export class AgendaController {
  constructor(private readonly agendaService: AgendaService) {}

  @Get()
  findAll(
    @TenantFromJwt() tenantId: string,
    @Query('date') date?: string,
    @Query('professionalId') professionalId?: string,
  ) {
    return this.agendaService.findAll(tenantId, { date, professionalId })
  }

  @Get(':id')
  findOne(@TenantFromJwt() tenantId: string, @Param('id') id: string) {
    return this.agendaService.findOne(tenantId, id)
  }

  @Post()
  create(@TenantFromJwt() tenantId: string, @Body() dto: CreateAppointmentDto) {
    return this.agendaService.create(tenantId, dto)
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
