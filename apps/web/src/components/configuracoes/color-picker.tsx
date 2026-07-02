'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const i = Math.floor(h / 60) % 6
  const f = h / 60 - Math.floor(h / 60)
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const map: [number, number, number][] = [
    [v, t, p], [q, v, p], [p, v, t],
    [p, q, v], [t, p, v], [v, p, q],
  ]
  const [r, g, b] = map[i] ?? [0, 0, 0]
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const d = max - min
  const s = max === 0 ? 0 : d / max
  const v = max
  let h = 0
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + 6) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
  }
  return [Math.round(h), s, v]
}

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.replace('#', '').padStart(6, '0'))
  if (!m) return null
  const v = parseInt(m[1]!, 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

interface ColorPickerProps {
  value: string
  onChange: (hex: string) => void
  onApply: (hex: string) => void
}

export default function ColorPicker({ value, onChange, onApply }: ColorPickerProps) {
  const rgb = hexToRgb(value) ?? [61, 43, 31]
  const [hue, sat, bri] = rgbToHsv(...rgb)

  const [h, setH] = useState(hue)
  const [s, setS] = useState(sat)
  const [v, setV] = useState(bri)
  const [hexInput, setHexInput] = useState(value.replace('#', ''))
  const [rgbInput, setRgbInput] = useState<[string, string, string]>(rgb.map(String) as [string, string, string])

  const gradRef = useRef<HTMLDivElement>(null)
  const hueRef  = useRef<HTMLDivElement>(null)
  const draggingGrad = useRef(false)
  const draggingHue  = useRef(false)

  const currentRgb = hsvToRgb(h, s, v)
  const currentHex = rgbToHex(...currentRgb)

  useEffect(() => {
    const rgb2 = hexToRgb(value) ?? [61, 43, 31]
    const [h2, s2, v2] = rgbToHsv(...rgb2)
    setH(h2); setS(s2); setV(v2)
    setHexInput(value.replace('#', ''))
    setRgbInput(rgb2.map(String) as [string, string, string])
  }, [value])

  const updateFromGrad = useCallback((clientX: number, clientY: number) => {
    const el = gradRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const ns = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const nv = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height))
    setS(ns); setV(nv)
    const hex = rgbToHex(...hsvToRgb(h, ns, nv))
    setHexInput(hex.replace('#', ''))
    setRgbInput(hsvToRgb(h, ns, nv).map(String) as [string, string, string])
    onChange(hex)
  }, [h, onChange])

  const updateFromHue = useCallback((clientX: number) => {
    const el = hueRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const nh = Math.max(0, Math.min(360, ((clientX - rect.left) / rect.width) * 360))
    setH(nh)
    const hex = rgbToHex(...hsvToRgb(nh, s, v))
    setHexInput(hex.replace('#', ''))
    setRgbInput(hsvToRgb(nh, s, v).map(String) as [string, string, string])
    onChange(hex)
  }, [s, v, onChange])

  useEffect(() => {
    function onMove(e: MouseEvent) {
      if (draggingGrad.current) updateFromGrad(e.clientX, e.clientY)
      if (draggingHue.current)  updateFromHue(e.clientX)
    }
    function onUp() { draggingGrad.current = false; draggingHue.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [updateFromGrad, updateFromHue])

  function handleHexInput(raw: string) {
    setHexInput(raw)
    const clean = raw.replace('#', '')
    if (clean.length === 6) {
      const parsed = hexToRgb('#' + clean)
      if (parsed) {
        const [h2, s2, v2] = rgbToHsv(...parsed)
        setH(h2); setS(s2); setV(v2)
        setRgbInput(parsed.map(String) as [string, string, string])
        onChange('#' + clean)
      }
    }
  }

  function handleRgbInput(idx: 0 | 1 | 2, raw: string) {
    const next = [...rgbInput] as [string, string, string]
    next[idx] = raw
    setRgbInput(next)
    const nums = next.map(Number)
    if (nums.every((n) => !isNaN(n) && n >= 0 && n <= 255)) {
      const [r, g, b] = nums as [number, number, number]
      const [h2, s2, v2] = rgbToHsv(r, g, b)
      setH(h2); setS(s2); setV(v2)
      const hex = rgbToHex(r, g, b)
      setHexInput(hex.replace('#', ''))
      onChange(hex)
    }
  }

  const pureHue = rgbToHex(...hsvToRgb(h, 1, 1))
  const thumbX = `${s * 100}%`
  const thumbY = `${(1 - v) * 100}%`
  const hueX   = `${(h / 360) * 100}%`

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-md">
      {/* Gradient */}
      <div
        ref={gradRef}
        className="relative h-[160px] w-full cursor-crosshair rounded-md"
        style={{ background: `linear-gradient(to bottom, transparent, #000), linear-gradient(to right, #fff, ${pureHue})` }}
        onMouseDown={(e) => { draggingGrad.current = true; updateFromGrad(e.clientX, e.clientY) }}
      >
        <div
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: thumbX, top: thumbY }}
        />
      </div>

      {/* Hue bar */}
      <div
        ref={hueRef}
        className="relative h-4 w-full cursor-pointer rounded-full"
        style={{ background: 'linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00)' }}
        onMouseDown={(e) => { draggingHue.current = true; updateFromHue(e.clientX) }}
      >
        <div
          className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
          style={{ left: hueX, backgroundColor: pureHue }}
        />
      </div>

      {/* Swatch + inputs */}
      <div className="flex items-center gap-3">
        <div
          className="h-9 w-9 shrink-0 rounded-md border border-[#E2E8F0]"
          style={{ backgroundColor: currentHex }}
        />
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <p className="mb-0.5 text-[10px] text-[#94A3B8]">HEX</p>
            <div className="flex items-center rounded-md border border-[#E2E8F0] px-2 py-1">
              <span className="text-[12px] text-[#94A3B8]">#</span>
              <input
                value={hexInput}
                onChange={(e) => handleHexInput(e.target.value)}
                maxLength={6}
                className="w-full bg-transparent text-[12px] text-[#0F172A] outline-none"
              />
            </div>
          </div>
          {(['R','G','B'] as const).map((label, i) => (
            <div key={label} className="w-12">
              <p className="mb-0.5 text-[10px] text-[#94A3B8]">{label}</p>
              <input
                type="number"
                min={0}
                max={255}
                value={rgbInput[i]}
                onChange={(e) => handleRgbInput(i as 0|1|2, e.target.value)}
                className="w-full rounded-md border border-[#E2E8F0] px-1 py-1 text-center text-[12px] text-[#0F172A] outline-none focus:border-[#2563EB] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onApply(currentHex)}
        className="h-9 w-full rounded-md bg-[#2563EB] text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]"
      >
        Aplicar cor
      </button>
    </div>
  )
}
