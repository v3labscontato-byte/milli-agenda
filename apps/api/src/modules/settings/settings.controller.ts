import { Controller, Get, Patch, Body, UseGuards, Param, Query } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { SettingsService } from './settings.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('public/:slug')
  getPublicTenant(@Param('slug') slug: string) {
    return this.settingsService.getPublicTenant(slug)
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getSettings(@TenantFromJwt() tenantId: string) {
    return this.settingsService.getSettings(tenantId)
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateSettings(@TenantFromJwt() tenantId: string, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.updateSettings(tenantId, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get('google-place')
  getGooglePlace(@Query('address') address: string) {
    return this.settingsService.findGooglePlace(address)
  }
}
