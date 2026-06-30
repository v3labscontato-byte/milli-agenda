'use client'

import { useState, useCallback } from 'react'

interface ComandaDetalhe {
  items: Array<{ name: string; quantity: number; unitPrice: number; serviceId?: string; productId?: string }>
  discount: { type: 'amount'; value: number } | null
  finalAmount: number
  deposit: { amount: number; method: string; paidAt: string } | null
}

export function useComandaDetalhe() {
  const [detalhe, setDetalhe] = useState<ComandaDetalhe | null>(null)

  const loadComandaDetalhe = useCallback(async ({
    commandId,
    fallbackName,
    fallbackPrice,
  }: {
    commandId?: string
    fallbackName: string
    fallbackPrice: number
  }) => {
    if (!commandId) { setDetalhe(null); return }
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      const base = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${base}/api/v1/commands/${commandId}`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cmd = await res.json() as { data?: any }
      if (!cmd.data) { setDetalhe(null); return }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawItems = (cmd.data.items ?? []).map((i: any) => ({
        name: (i.service?.name ?? i.product?.name ?? '') as string,
        serviceId: i.serviceId as string | undefined,
        productId: i.productId as string | undefined,
        quantity: i.quantity as number,
        unitPrice: Number(i.unitPrice),
      }))
      const discountAmount = Number(cmd.data.discountAmount ?? 0)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const payments: any[] = cmd.data.payments ?? []
      const firstPayment = payments[0] ?? null
      setDetalhe({
        items: rawItems.length > 0 ? rawItems : [{ name: fallbackName, quantity: 1, unitPrice: fallbackPrice }],
        discount: discountAmount > 0 ? { type: 'amount', value: discountAmount } : null,
        finalAmount: Number(cmd.data.finalAmount),
        deposit: firstPayment ? {
          amount: Number(firstPayment.amount),
          method: firstPayment.method as string,
          paidAt: (() => {
            const raw = firstPayment.paidAt as string
            return raw ? raw.slice(0, 10).split('-').reverse().join('/') : ''
          })(),
        } : null,
      })
    } catch {
      setDetalhe(null)
    }
  }, [])

  const clearDetalhe = useCallback(() => setDetalhe(null), [])

  return { detalhe, loadComandaDetalhe, clearDetalhe }
}

type ItemWithId = { serviceId?: string; productId?: string }

/** Returns only items from resultItems whose serviceId/productId is NOT already in existingItems. */
export function filterNewItems<T extends ItemWithId>(resultItems: T[], existingItems: ItemWithId[]): T[] {
  const existingServiceIds = new Set(existingItems.map((i) => i.serviceId).filter((id): id is string => !!id))
  const existingProductIds = new Set(existingItems.map((i) => i.productId).filter((id): id is string => !!id))
  return resultItems.filter((i) => {
    if (i.serviceId) return !existingServiceIds.has(i.serviceId)
    if (i.productId) return !existingProductIds.has(i.productId)
    return false
  })
}
