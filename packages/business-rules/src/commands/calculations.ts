export interface CommandItemInput {
  quantity: number
  unitPrice: number
  discount?: number
}

export interface CommandTotals {
  totalAmount: number
  discountAmount: number
  finalAmount: number
}

export function calcItemTotal(item: CommandItemInput): number {
  const gross = item.quantity * item.unitPrice
  const discount = item.discount ?? 0
  return Math.max(0, gross - discount)
}

export function calcCommandTotals(items: CommandItemInput[]): CommandTotals {
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  )
  const discountAmount = items.reduce(
    (sum, item) => sum + (item.discount ?? 0),
    0,
  )
  const finalAmount = Math.max(0, totalAmount - discountAmount)

  return {
    totalAmount: round2(totalAmount),
    discountAmount: round2(discountAmount),
    finalAmount: round2(finalAmount),
  }
}

export function applyPercentDiscount(
  totalAmount: number,
  pct: number,
): number {
  if (pct < 0 || pct > 100) throw new Error('Discount percentage must be 0–100')
  return round2((totalAmount * pct) / 100)
}

export function calcProfessionalCommission(
  total: number,
  commissionPct: number,
): number {
  if (commissionPct < 0 || commissionPct > 100)
    throw new Error('Commission percentage must be 0–100')
  return round2((total * commissionPct) / 100)
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}
