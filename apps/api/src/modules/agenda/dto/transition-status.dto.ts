import { IsEnum } from 'class-validator'
import { AppointmentStatus } from '@milli/shared-types'

export class TransitionStatusDto {
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus
}
