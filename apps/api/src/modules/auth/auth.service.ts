import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { DatabaseService } from '../../infra/database/database.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto, PlanOption } from './dto/register.dto'
import { PlanSlug, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

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

  logout() { return { message: 'Logged out successfully' } }

  private issueTokens(sub: string, tenantId: string, tenantSlug: string, email: string, role: string) {
    const payload = { sub, tenantId, tenantSlug, email, role }
    return {
      accessToken: this.jwt.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwt.sign(payload, { expiresIn: '30d' }),
    }
  }
}
