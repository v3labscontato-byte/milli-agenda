import { Controller, Get, Post, Body, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { TenantFromJwt } from '../../common/decorators/tenant.decorator'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { RefreshTokenDto } from './dto/refresh-token.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  logout() {
    return this.authService.logout()
  }

  @UseGuards(JwtAuthGuard)
  @Get('onboarding')
  getOnboardingStatus(@TenantFromJwt() tenantId: string) {
    return this.authService.getOnboardingStatus(tenantId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboarding/complete')
  @HttpCode(HttpStatus.OK)
  completeOnboarding(@TenantFromJwt() tenantId: string) {
    return this.authService.completeOnboarding(tenantId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('onboarding/nicho')
  @HttpCode(HttpStatus.OK)
  selectNicho(
    @TenantFromJwt() tenantId: string,
    @Body() body: { nichoSlug: string },
  ) {
    return this.authService.selectNicho(tenantId, body.nichoSlug)
  }
}
