import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../../infra/database/database.service'
import { UpdateSettingsDto } from './dto/update-settings.dto'

const SETTINGS_SELECT = {
  id: true,
  name: true,
  slug: true,
  email: true,
  phone: true,
  document: true,
  logoUrl: true,
  plan: true,
  trialEndsAt: true,
  createdAt: true,
  businessHours: true,
  slotGapMinutes: true,
  minAdvanceHours: true,
  maxAdvanceDays: true,
  acceptedPaymentMethods: true,
  slogan: true,
  address: true,
  neighborhood: true,
  cep: true,
  city: true,
  state: true,
  depositRequired: true,
  depositType: true,
  depositValue: true,
  cancellationMinHours: true,
  cancellationFeePercent: true,
  cancellationRefundSignal: true,
} as const

const PUBLIC_TENANT_SELECT = {
  name: true,
  slug: true,
  logoUrl: true,
  slogan: true,
  address: true,
  neighborhood: true,
  city: true,
  state: true,
  phone: true,
  businessHours: true,
  acceptedPaymentMethods: true,
  depositRequired: true,
  depositType: true,
  depositValue: true,
  cancellationMinHours: true,
  cancellationFeePercent: true,
  cancellationRefundSignal: true,
} as const

@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}

  async getSettings(tenantId: string) {
    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: SETTINGS_SELECT,
    })
    if (!tenant) throw new NotFoundException('Tenant not found')
    return tenant
  }

  async updateSettings(tenantId: string, dto: UpdateSettingsDto) {
    return this.db.tenant.update({
      where: { id: tenantId },
      data: dto,
      select: { ...SETTINGS_SELECT, updatedAt: true },
    })
  }

  async getPublicTenant(slug: string) {
    const tenant = await this.db.tenant.findUnique({
      where: { slug },
      select: PUBLIC_TENANT_SELECT,
    })
    if (!tenant) throw new NotFoundException('Tenant not found')
    return tenant
  }
}
