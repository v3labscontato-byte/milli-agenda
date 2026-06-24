// ─── Enums ────────────────────────────────────────────────────────────────────

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_SERVICE = 'IN_SERVICE',
  AWAITING_PAYMENT = 'AWAITING_PAYMENT',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
}

export enum CommandStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  AUTHORIZED = 'AUTHORIZED',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BANK_TRANSFER = 'BANK_TRANSFER',
  VOUCHER = 'VOUCHER',
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_ADMIN = 'TENANT_ADMIN',
  MANAGER = 'MANAGER',
  PROFESSIONAL = 'PROFESSIONAL',
  RECEPTIONIST = 'RECEPTIONIST',
  CLIENT = 'CLIENT',
}

export enum PlanSlug {
  FREE = 'FREE',
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE',
}

// ─── Generic Types ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    page?: number
    perPage?: number
    total?: number
    totalPages?: number
  }
}

export interface DomainEvent<T = unknown> {
  id: string
  type: string
  aggregateId: string
  aggregateType: string
  tenantId: string
  occurredAt: Date
  payload: T
  metadata?: Record<string, unknown>
}

// ─── Pagination ────────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number
  perPage: number
}

export interface PaginatedResult<T> {
  data: T[]
  meta: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}
