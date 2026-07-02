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
  primaryColor: true,
  instagram: true,
  acceptingNewClients: true,
  welcomeMessage: true,
  googlePlaceId: true,
  referralBonus: true,
  pointsPerReal: true,
} as const

const PUBLIC_TENANT_SELECT = {
  name: true,
  slug: true,
  logoUrl: true,
  coverImageUrl: true,
  primaryColor: true,
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
  instagram: true,
  acceptingNewClients: true,
  welcomeMessage: true,
  googlePlaceId: true,
  referralBonus: true,
  pointsPerReal: true,
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

  async findGooglePlace(address: string) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY
    if (!apiKey) return null
    const input = encodeURIComponent(address ?? '')
    const url =
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json` +
      `?input=${input}&inputtype=textquery` +
      `&fields=place_id,name,rating,user_ratings_total&key=${apiKey}`
    try {
      const res = await fetch(url)
      const json = await res.json() as { candidates?: Array<{ place_id: string; name: string; rating: number; user_ratings_total: number }> }
      const c = json.candidates?.[0]
      if (!c) return null
      return { placeId: c.place_id, name: c.name, rating: c.rating, totalRatings: c.user_ratings_total }
    } catch {
      return null
    }
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
