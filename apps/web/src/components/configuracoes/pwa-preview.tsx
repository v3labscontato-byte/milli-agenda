'use client'

interface PwaPreviewProps {
  primaryColor: string
  salonName: string
  slogan: string | null
  logoUrl: string | null
}

function getInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0] ?? '').join('').toUpperCase()
}

export default function PwaPreview({ primaryColor, salonName, slogan, logoUrl }: PwaPreviewProps) {
  const color = primaryColor || '#3D2B1F'

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[22px] border-4 border-[#0F172A] shadow-xl"
      style={{ width: 130, height: 260 }}
      aria-label="Preview do app do cliente"
    >
      {/* Status bar mock */}
      <div className="flex h-5 items-center justify-between bg-[#0F172A] px-3">
        <span className="text-[8px] font-semibold text-white">9:41</span>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-3 rounded-sm bg-white opacity-80" />
          <div className="h-1.5 w-1.5 rounded-full bg-white opacity-80" />
        </div>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center justify-end pb-3 pt-5" style={{ backgroundColor: color, minHeight: 90 }}>
        {logoUrl ? (
          <img src={logoUrl} alt={salonName} className="mb-1.5 h-10 w-10 rounded-full object-cover shadow" />
        ) : (
          <div
            className="mb-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-[13px] font-bold text-white shadow"
          >
            {getInitials(salonName) || '??'}
          </div>
        )}
        <p className="text-center text-[10px] font-bold leading-tight text-white drop-shadow">
          {salonName || 'Meu Salão'}
        </p>
        {slogan && (
          <p className="mt-0.5 line-clamp-1 px-2 text-center text-[7px] text-white/80">{slogan}</p>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 bg-[#F8FAFC] p-2">
        {/* Next appointment mock */}
        <div className="rounded-lg bg-white p-2 shadow-sm">
          <p className="text-[7px] font-semibold text-[#64748B]">Próximo agendamento</p>
          <p className="mt-0.5 text-[8px] font-medium text-[#0F172A]">Hoje, 14:30</p>
          <p className="text-[7px] text-[#64748B]">Corte + Barba</p>
        </div>

        {/* CTA button */}
        <button
          type="button"
          className="w-full rounded-lg py-1.5 text-[9px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: color }}
        >
          Agendar agora
        </button>

        {/* Quick access */}
        <div className="grid grid-cols-2 gap-1.5">
          {['✂️ Serviços', '⭐ Pontos', '🤝 Indicar', '🏷️ Promo'].map((item) => (
            <div key={item} className="flex items-center gap-1 rounded-md bg-white px-1.5 py-1 shadow-sm">
              <span className="text-[8px]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
