// Standalone calculation utilities — no external deps, importable as @milli/business-rules in the future

export function calculateSubtotal(
  items: ReadonlyArray<{ quantity: number; unitPrice: number }>,
): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

export function calculateDiscount(
  subtotal: number,
  discount: { type: 'amount' | 'percent'; value: number } | null,
): number {
  if (!discount || discount.value <= 0) return 0
  if (discount.type === 'percent') return Math.min(subtotal, (subtotal * discount.value) / 100)
  return Math.min(subtotal, discount.value)
}

export function calculateTotal(subtotal: number, discountAmount: number): number {
  return Math.max(0, subtotal - discountAmount)
}

export function calculateChange(totalPaid: number, totalDue: number): number {
  return Math.max(0, totalPaid - totalDue)
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
