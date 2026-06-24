import { AppointmentStatus } from '@milli/shared-types'

const TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.SCHEDULED]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.CHECKED_IN]: [
    AppointmentStatus.IN_SERVICE,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.IN_SERVICE]: [
    AppointmentStatus.AWAITING_PAYMENT,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.AWAITING_PAYMENT]: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
}

export function canTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
): boolean {
  return TRANSITIONS[from].includes(to)
}

export function assertTransition(
  from: AppointmentStatus,
  to: AppointmentStatus,
): void {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid appointment transition: ${from} → ${to}`)
  }
}

export function isFinalStatus(status: AppointmentStatus): boolean {
  return TRANSITIONS[status].length === 0
}
