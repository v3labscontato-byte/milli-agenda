import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DatabaseService } from '../../infra/database/database.service'
import { TemplateEngineService } from '../template-engine/template-engine.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto, PlanOption } from './dto/register.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { PlanSlug, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'

const PLAN_MAP: Record<PlanOption, PlanSlug> = {
  [PlanOption.STARTER]:    PlanSlug.STARTER,
  [PlanOption.PRO]:        PlanSlug.PROFESSIONAL,
  [PlanOption.ENTERPRISE]: PlanSlug.ENTERPRISE,
}

function toPublicUser(u: { id: string; name: string; email: string; role: string }) {
  return { id: u.id, name: u.name, email: u.email, roles: [u.role] }
}
function toPublicTenant(t: { id: string; name: string; slug: string }) {
  return { id: t.id, name: t.name, slug: t.slug }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
    private readonly templateEngine: TemplateEngineService,
  ) {}

  async register(dto: RegisterDto) {
    const slugInUse = await this.db.tenant.findUnique({ where: { slug: dto.slug } })
    if (slugInUse) throw new ConflictException('Slug já em uso')

    const emailInUse = await this.db.user.findFirst({ where: { email: dto.email } })
    if (emailInUse) throw new ConflictException('E-mail já cadastrado')

    const passwordHash = await bcrypt.hash(dto.password, 12)

    const plan = dto.plan ? PLAN_MAP[dto.plan] : PlanSlug.STARTER

    const tenant = await this.db.tenant.create({
      data: {
        name: dto.salonName,
        slug: dto.slug,
        phone: dto.phone,
        email: dto.email,
        plan,
        active: true,
      },
    })

    const user = await this.db.user.create({
      data: {
        tenantId: tenant.id,
        name: dto.ownerName,
        email: dto.email,
        passwordHash,
        role: UserRole.TENANT_ADMIN,
        active: true,
      },
    })

    const tokens = this.issueTokens(user.id, tenant.id, tenant.slug, user.email, user.role)
    return { ...tokens, user: toPublicUser(user), tenant: toPublicTenant(tenant) }
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.db.user.findFirst({
        where: { email: dto.email, active: true },
        include: { tenant: true },
      })
      if (!user || !user.tenant?.active) throw new UnauthorizedException('Invalid credentials')

      const valid = await bcrypt.compare(dto.password, user.passwordHash)
      if (!valid) throw new UnauthorizedException('Invalid credentials')

      const { tenant } = user
      const tokens = this.issueTokens(user.id, tenant.id, tenant.slug, user.email, user.role)
      return { ...tokens, user: toPublicUser(user), tenant: toPublicTenant(tenant) }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err
      this.logger.error('Login error:', err)
      throw err
    }
  }

  async refresh(token: string) {
    try {
      const payload = this.jwt.verify<{
        sub: string; tenantId: string; tenantSlug: string; email: string; role: string
      }>(token)
      return this.issueTokens(payload.sub, payload.tenantId, payload.tenantSlug, payload.email, payload.role)
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const tenant = await this.db.tenant.findUnique({ where: { slug: dto.tenantSlug } })
    const user = tenant
      ? await this.db.user.findFirst({ where: { email: dto.email, tenantId: tenant.id, active: true } })
      : null

    if (user) {
      const token = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
      await this.db.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } })
      const link = `${process.env.FRONTEND_URL ?? 'https://milli-agenda-production.up.railway.app'}/reset-password?token=${token}`
      this.logger.log(`[RESET PASSWORD] ${dto.email} → ${link}`)
    }

    return { message: 'Se este e-mail estiver cadastrado, você receberá um link em breve.' }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.db.passwordResetToken.findUnique({ where: { token: dto.token } })
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('Token inválido ou expirado')
    }

    const passwordHash = await bcrypt.hash(dto.password, 12)
    await this.db.user.update({ where: { id: record.userId }, data: { passwordHash } })
    await this.db.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })

    return { message: 'Senha redefinida com sucesso.' }
  }

  logout() { return { message: 'Logged out successfully' } }

  async getOnboardingStatus(tenantId: string) {
    const tenant = await this.db.tenant.findUnique({
      where: { id: tenantId },
      select: {
        id: true,
        name: true,
        slug: true,
        plan: true,
        createdAt: true,
        onboardingCompleted: true,
        nichoSlug: true,
      },
    })
    if (!tenant) throw new NotFoundException('Tenant not found')

    const [serviceCount, professionalCount, categoryCount] = await Promise.all([
      this.db.service.count({ where: { tenantId, active: true } }),
      this.db.professional.count({ where: { tenantId } }),
      this.db.serviceCategory.count({ where: { tenantId, status: true } }),
    ])

    return {
      completed: tenant.onboardingCompleted,
      nichoSlug: tenant.nichoSlug,
      hasServices: serviceCount > 0,
      hasProfessionals: professionalCount > 0,
      hasCategories: categoryCount > 0,
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
        plan: tenant.plan,
        createdAt: tenant.createdAt,
      },
    }
  }

  async completeOnboarding(tenantId: string) {
    return this.db.tenant.update({
      where: { id: tenantId },
      data: { onboardingCompleted: true },
      select: { id: true, onboardingCompleted: true },
    })
  }

  async selectNicho(tenantId: string, nichoSlug: string) {
    return this.templateEngine.importTemplate(tenantId, nichoSlug)
  }

  private issueTokens(sub: string, tenantId: string, tenantSlug: string, email: string, role: string) {
    const payload = { sub, tenantId, tenantSlug, email, role }
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwt.sign(payload, { expiresIn: '30d' }),
    }
  }
}
