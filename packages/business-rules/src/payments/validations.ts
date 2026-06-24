import { PaymentMethod } from '@milli/shared-types'

export interface PaymentInput {
  amount: number
  method: PaymentMethod
  commandFinalAmount: number
  alreadyPaid: number
}

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validatePayment(input: PaymentInput): ValidationResult {
  if (input.amount <= 0) {
    return { valid: false, error: 'Payment amount must be greater than zero' }
  }

  const remaining = round2(input.commandFinalAmount - input.alreadyPaid)

  if (remaining <= 0) {
    return { valid: false, error: 'Command is already fully paid' }
  }

  if (input.amount > remaining) {
    return {
      valid: false,
      error: `Amount exceeds remaining balance of ${remaining}`,
    }
  }

  return { valid: true }
}

export function isRefundable(method: PaymentMethod): boolean {
  return [
    PaymentMethod.CREDIT_CARD,
    PaymentMethod.DEBIT_CARD,
    PaymentMethod.PIX,
  ].includes(method)
}

export function calcChange(paid: number, total: number): number {
  return Math.max(0, round2(paid - total))
}

export function isCommandFullyPaid(
  finalAmount: number,
  alreadyPaid: number,
): boolean {
  return round2(alreadyPaid) >= round2(finalAmount)
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
