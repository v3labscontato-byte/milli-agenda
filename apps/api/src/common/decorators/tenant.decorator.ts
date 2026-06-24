import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface JwtPayload {
  sub: string
  tenantId: string
  email: string
  role: string
}

export const TenantFromJwt = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest()
    return (request.user as JwtPayload).tenantId
  },
)

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as JwtPayload
  },
)
