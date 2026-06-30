'use client'

import { useState, useMemo, useCallback } from 'react'
import { ClipboardList, CreditCard, ReceiptText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHistoricoAgendamentos } from '@/hooks/use-historico-agendamentos'
import PaymentModal, { type PaymentResult } from '@/components/shared/payment-modal'
import { type CalendarAppointment } from '@/lib/calendar-utils'
import { useComandaDetalhe, filterNewItems } from '@/hooks/use-comanda-detalhe'

// ─── Types & config ───────────────────────────────────────────────────────────

type Filter = 'ALL' | 'PENDING' | 'PAID' | 'CANCELLED'

const FILTER_PILLS: { label: string; value: Filter }[] = [
  { label: 'Todas',      value: 'ALL'       },
  { label: 'Pendentes',  value: 'PENDING'   },
  { label: 'Pagas',      value: 'PAID'      },
  { label: 'Canceladas', value: 'CANCELLED' },
]

const METHOD_MAP: Record<string, string> = {
  pix: 'PIX', dinheiro: 'CASH', debito: 'DEBIT_CARD',
  credito: 'CREDIT_CARD', voucher: 'VOUCHER', transferencia: 'BANK_TRANSFER',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyFilter(appts: CalendarAppointment[], filter: Filter): CalendarAppointment[] {
  if (filter === 'PENDING')   return appts.filter((a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
  if (filter === 'PAID')      return appts.filter((a) => a.status === 'COMPLETED')
  if (filter === 'CANCELLED') return appts.filter((a) => a.status === 'CANCELLED')
  return appts
}

function fmtBRL(n: number) {
  return `R$ ${n.toFixed(2).replace('.', ',')}`
}

// ─── Cell styles ──────────────────────────────────────────────────────────────

const PAY_STYLES = {
  pago:     { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Pago'     },
  pendente: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Pendente' },
} as const

const AT_STYLES: Record<string, { bg: string; text: string; border: string; label: string }> = {
  COMPLETED:       { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0', label: 'Realizado'      },
  CANCELLED:       { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA', label: 'Cancelado'      },
  CONFIRMED:       { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Confirmado'     },
  SCHEDULED:       { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Pendente'       },
  CHECKED_IN:      { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Check-in'       },
  IN_SERVICE:      { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', label: 'Em serviço'     },
  AWAITING_PAYMENT:{ bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: 'Aguard. Pagto'  },
  NO_SHOW:         { bg: '#FEF9C3', text: '#713F12', border: '#FDE047', label: 'Não compareceu' },
}

const TH = 'px-3 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#475569] text-left'

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ComandasPage() {
  const { data, loading, error, refetch } = useHistoricoAgendamentos()
  const [filter, setFilter]               = useState<Filter>('ALL')
  const [searchQuery, setSearchQuery]     = useState('')
  const [paymentAppt, setPaymentAppt]     = useState<CalendarAppointment | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const { detalhe, loadComandaDetalhe, clearDetalhe } = useComandaDetalhe()

  const kpis = useMemo(() => ({
    total:    data.length,
    pending:  data.filter((a) => a.status !== 'COMPLETED' && a.status !== 'CANCELLED').length,
    received: data.filter((a) => a.status === 'COMPLETED').reduce((s, a) => s + a.amount, 0),
    cancelled: data.filter((a) => a.status === 'CANCELLED').length,
  }), [data])

  const filtered = useMemo(() => {
    let result = applyFilter(data, filter)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((a) =>
        (a.client ?? '').toLowerCase().includes(q) ||
        (a.service ?? '').toLowerCase().includes(q) ||
        (a.professional ?? '').toLowerCase().includes(q),
      )
    }
    return [...result].sort((a, b) =>
      b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime),
    )
  }, [data, filter, searchQuery])

  const handlePaymentConfirm = useCallback(async (result: PaymentResult) => {
    if (!paymentAppt) return
    setPaymentLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const base = process.env.NEXT_PUBLIC_API_URL
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

      let commandId: string | undefined = paymentAppt.commandId
      if (!commandId) {
        const cmdRes = await fetch(`${base}/api/v1/commands`, {
          method: 'POST', headers,
          body: JSON.stringify({ clientId: paymentAppt.clientId, appointmentId: paymentAppt.id }),
        })
        const cmd = (await cmdRes.json()) as { data?: { id: string } }
        commandId = cmd.data?.id
      }
      if (!commandId) throw new Error('Comanda não criada')

      const extraItems = filterNewItems(result.items ?? [], detalhe?.items ?? [])
      for (const item of extraItems) {
        const itemRes = await fetch(`${base}/api/v1/commands/${commandId}/items`, {
          method: 'POST', headers,
          body: JSON.stringify({
            ...(item.productId ? { productId: item.productId } : { serviceId: item.serviceId }),
            quantity: item.quantity,
          }),
        })
        if (!itemRes.ok) {
          const err = await itemRes.json() as { message?: string }
          throw new Error(err.message ?? 'Erro ao adicionar item')
        }
      }

      const discountAmt = result.discountAbsolute ?? 0
      if (discountAmt > 0) {
        await fetch(`${base}/api/v1/commands/${commandId}/discount`, {
          method: 'POST', headers,
          body: JSON.stringify({ amount: discountAmt }),
        })
      }

      for (const m of (result.methods ?? []).filter((m) => m.amount > 0)) {
        const payRes = await fetch(`${base}/api/v1/payments`, {
          method: 'POST', headers,
          body: JSON.stringify({
            commandId,
            method: METHOD_MAP[m.method] ?? m.method.toUpperCase(),
            amount: m.amount,
          }),
        })
        if (!payRes.ok) {
          const err = await payRes.json() as { message?: string }
          throw new Error(err.message ?? 'Erro ao registrar pagamento')
        }
      }

      try {
        await fetch(`${base}/api/v1/commands/${commandId}/close`, {
          method: 'POST', headers,
          body: JSON.stringify({}),
        })
      } catch (e) {
        console.error('[close] falhou:', e)
      }

      await fetch(`${base}/api/v1/appointments/${paymentAppt.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ status: 'COMPLETED' }),
      })

      refetch()
    } catch (e) {
      console.error('[comandas] pagamento:', e)
      if (e instanceof Error) alert(e.message)
    } finally {
      setPaymentLoading(false)
      setPaymentAppt(null)
    }
  }, [paymentAppt, refetch, detalhe])

  const openPaymentModal = useCallback(async (appt: CalendarAppointment) => {
    setPaymentAppt(appt)
    await loadComandaDetalhe({ commandId: appt.commandId, fallbackName: appt.service, fallbackPrice: appt.amount })
  }, [loadComandaDetalhe])

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex h-full flex-col animate-pulse">
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-[#F1F5F9]" />)}
        </div>
      </div>
      <div className="flex-1 space-y-3 p-6">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-12 rounded-lg bg-[#F1F5F9]" />)}
      </div>
    </div>
  )

  if (error) return (
    <div className="flex h-full items-center justify-center">
      <p className="text-[14px] text-[#DC2626]">{error}</p>
    </div>
  )

  return (
    <div className="flex h-full flex-col overflow-hidden">

      {/* KPI strip */}
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-6 py-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {([
            { label: 'Atendimentos', value: String(kpis.total),    color: '#2563EB', filterValue: 'ALL'       },
            { label: 'Pendentes',    value: String(kpis.pending),   color: '#D97706', filterValue: 'PENDING'   },
            { label: 'Recebido',     value: fmtBRL(kpis.received),  color: '#16A34A', filterValue: 'PAID'      },
            { label: 'Cancelados',   value: String(kpis.cancelled), color: '#DC2626', filterValue: 'CANCELLED' },
          ] as { label: string; value: string; color: string; filterValue: Filter }[]).map(({ label, value, color, filterValue }) => (
            <button
              key={label}
              type="button"
              onClick={() => setFilter(filterValue)}
              aria-pressed={filter === filterValue}
              className={cn(
                'cursor-pointer rounded-xl border p-4 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                filter === filterValue
                  ? 'border-[#2563EB] bg-[#EFF6FF] shadow-none'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] shadow-[0_1px_3px_0_rgb(0_0_0/0.06)] hover:border-[#94A3B8] hover:bg-white',
              )}
            >
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#94A3B8]">{label}</p>
              <p className="mt-1 text-[22px] font-semibold leading-none" style={{ color }}>{value}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search + filter pills */}
      <div className="shrink-0 border-b border-[#E2E8F0] bg-white px-5 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="search"
            placeholder="Buscar cliente, serviço, profissional..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              'min-w-0 flex-1 rounded-md border border-[#E2E8F0] bg-[#F8FAFC]',
              'px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#64748B]',
              'focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#DBEAFE]',
            )}
          />
          <div className="flex shrink-0 flex-wrap gap-1.5" role="group" aria-label="Filtrar por status">
            {FILTER_PILLS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={cn(
                  'rounded-sm border px-3 py-1.5 text-[12px] font-medium',
                  'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  filter === value
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB]',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ReceiptText className="mb-4 h-12 w-12 text-[#CBD5E1]" aria-hidden="true" />
            <h3 className="font-medium text-[#475569]">Nenhum atendimento encontrado</h3>
            <p className="mt-1 text-[13px] text-[#94A3B8]">Tente outro filtro ou período.</p>
            {(filter !== 'ALL' || searchQuery.trim()) && (
              <button
                type="button"
                onClick={() => { setFilter('ALL'); setSearchQuery('') }}
                className="mt-4 rounded-md border border-[#E2E8F0] bg-white px-4 py-2 text-[13px] font-medium text-[#475569] transition-colors hover:border-[#2563EB] hover:text-[#2563EB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <table className="w-full min-w-[820px] border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <th className={TH}>Data</th>
                <th className={TH}>Hora</th>
                <th className={TH}>Cliente</th>
                <th className={cn(TH, 'hidden md:table-cell')}>Serviço</th>
                <th className={cn(TH, 'hidden lg:table-cell')}>Profissional</th>
                <th className={TH}>Pagamento</th>
                <th className={TH}>Valor</th>
                <th className={TH}>Atendimento</th>
                <th className={cn(TH, 'w-36 text-center')}>Comanda</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((appt) => {
                const [y, m, d] = appt.date.split('-')
                const isPaid      = appt.status === 'COMPLETED'
                const isCancelled = appt.status === 'CANCELLED'
                const payStyle    = isPaid ? PAY_STYLES.pago : PAY_STYLES.pendente
                const atStyle     = AT_STYLES[appt.status] ?? AT_STYLES.SCHEDULED
                const profFirst   = appt.professional?.split(' ')[0]

                return (
                  <tr
                    key={appt.id}
                    className="border-b border-[#E2E8F0] bg-white transition-colors last:border-0 hover:bg-[#F8FAFC]"
                  >
                    {/* Data */}
                    <td className="px-4 py-3 font-tabular text-[13px] text-[#475569]">{d}/{m}/{y}</td>

                    {/* Hora */}
                    <td className="px-4 py-3 font-tabular text-[13px] font-semibold text-[#0F172A]">
                      {appt.startTime}
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <p className="text-[14px] font-medium text-[#0F172A]">{appt.client}</p>
                      <p className="text-[12px] text-[#475569] md:hidden">{appt.service}</p>
                    </td>

                    {/* Serviço */}
                    <td className="hidden px-4 py-3 text-[14px] text-[#475569] md:table-cell">{appt.service}</td>

                    {/* Profissional */}
                    <td className="hidden px-4 py-3 text-[14px] text-[#475569] lg:table-cell">
                      {profFirst ?? '—'}
                    </td>

                    {/* Pagamento */}
                    <td className="px-4 py-3">
                      {isCancelled ? (
                        <span className="text-[#CBD5E1]">—</span>
                      ) : (
                        <span
                          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                          style={{ backgroundColor: payStyle.bg, color: payStyle.text, borderColor: payStyle.border }}
                        >
                          {payStyle.label}
                        </span>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'font-tabular text-[13px] font-medium',
                          isCancelled ? 'text-[#94A3B8] line-through' : 'text-[#0F172A]',
                        )}
                      >
                        {appt.amount > 0 ? fmtBRL(appt.amount) : '—'}
                      </span>
                    </td>

                    {/* Atendimento */}
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium"
                        style={{ backgroundColor: atStyle.bg, color: atStyle.text, borderColor: atStyle.border }}
                      >
                        {atStyle.label}
                      </span>
                    </td>

                    {/* Comanda */}
                    <td className="w-36 px-2 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => { void openPaymentModal(appt) }}
                        aria-label={`${isPaid ? 'Ver comanda' : 'Abrir comanda'}: ${appt.client}`}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5',
                          'text-[11px] font-medium transition-colors',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                        )}
                        style={
                          isPaid
                            ? { backgroundColor: '#F0FDF4', color: '#15803D', borderColor: '#BBF7D0' }
                            : isCancelled
                              ? { backgroundColor: '#F8FAFC', color: '#94A3B8', borderColor: '#E2E8F0' }
                              : { backgroundColor: '#FFFBEB', color: '#92400E', borderColor: '#FDE68A' }
                        }
                      >
                        {isPaid
                          ? <ClipboardList size={12} aria-hidden />
                          : <CreditCard size={12} aria-hidden />}
                        {isPaid ? 'Ver Comanda' : isCancelled ? 'Ver Comanda' : 'Abrir Comanda'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PaymentModal */}
      {paymentAppt && (
        <PaymentModal
          open
          onClose={() => { setPaymentAppt(null); clearDetalhe() }}
          onConfirm={handlePaymentConfirm}
          loading={paymentLoading}
          clientName={paymentAppt.client}
          professionalName={paymentAppt.professional ?? ''}
          serviceName={paymentAppt.service}
          date={(() => {
            const [y, m, d] = paymentAppt.date.split('-')
            return `${d}/${m}/${y}`
          })()}
          startTime={paymentAppt.startTime}
          endTime={paymentAppt.endTime}
          items={detalhe?.items ?? [{ name: paymentAppt.service, quantity: 1, unitPrice: paymentAppt.amount }]}
          initialDiscount={detalhe?.discount ?? null}
          deposit={detalhe?.deposit ?? null}
          isCompleted={paymentAppt.status === 'COMPLETED'}
          onReopen={async () => {
            const token = localStorage.getItem('accessToken')
            const tenantSlug = localStorage.getItem('tenantSlug') ?? ''
            const base = process.env.NEXT_PUBLIC_API_URL
            const headers = {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Tenant-Slug': tenantSlug,
            }
            if (paymentAppt.commandId) {
              await fetch(`${base}/api/v1/commands/${paymentAppt.commandId}/reopen`, {
                method: 'POST', headers, body: JSON.stringify({}),
              })
            }
            await fetch(`${base}/api/v1/appointments/${paymentAppt.id}`, {
              method: 'PATCH', headers,
              body: JSON.stringify({ status: 'CONFIRMED' }),
            })
            // Reload the modal in editable mode preserving comanda data
            await openPaymentModal({ ...paymentAppt, status: 'CONFIRMED' })
          }}
        />
      )}

    </div>
  )
}
