import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common'
import { PublicService } from './public.service'
import { CreatePublicAppointmentDto } from './dto/create-public-appointment.dto'

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':slug/services')
  getServices(
    @Param('slug') slug: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.publicService.getServices(slug, categoryId)
  }

  @Get(':slug/professionals')
  getProfessionals(
    @Param('slug') slug: string,
    @Query('serviceId') serviceId?: string,
  ) {
    return this.publicService.getProfessionals(slug, serviceId)
  }

  @Get(':slug/professionals/:professionalId/slots')
  getSlots(
    @Param('slug') slug: string,
    @Param('professionalId') professionalId: string,
    @Query('date') date: string,
    @Query('durationMin') durationMin: string,
  ) {
    return this.publicService.getSlots(slug, professionalId, date, Number(durationMin))
  }

  @Post(':slug/appointments')
  createAppointment(
    @Param('slug') slug: string,
    @Body() dto: CreatePublicAppointmentDto,
  ) {
    return this.publicService.createAppointment(slug, dto)
  }

  @Get(':slug/appointments')
  getAppointmentsByPhone(
    @Param('slug') slug: string,
    @Query('phone') phone: string,
  ) {
    return this.publicService.getAppointmentsByPhone(slug, phone ?? '')
  }

  @Get(':slug/appointments/:id')
  getAppointmentById(
    @Param('slug') slug: string,
    @Param('id') id: string,
  ) {
    return this.publicService.getAppointmentById(slug, id)
  }

  @Patch(':slug/appointments/:id/cancel')
  cancelAppointment(
    @Param('slug') slug: string,
    @Param('id') id: string,
    @Body('phone') phone: string,
  ) {
    return this.publicService.cancelAppointment(slug, id, phone ?? '')
  }
}
