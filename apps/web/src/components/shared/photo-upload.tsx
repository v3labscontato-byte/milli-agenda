'use client'

import { useId, useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface PhotoUploadProps {
  photos: string[]
  onChange: (photos: string[]) => void
  maxPhotos?: number
  maxSizeMB?: number
  label?: string
  sublabel?: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function PhotoUpload({
  photos,
  onChange,
  maxPhotos = 6,
  maxSizeMB = 5,
  label = 'Fotos',
  sublabel,
}: PhotoUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [errors, setErrors] = useState<string[]>([])

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return

    const errs: string[] = []
    const toAdd: File[] = []

    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errs.push(`"${file.name}": formato inválido (use JPG, PNG ou WEBP)`)
        continue
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        errs.push(`"${file.name}": excede ${maxSizeMB}MB`)
        continue
      }
      toAdd.push(file)
    }

    const remaining = maxPhotos - photos.length
    const willAdd = toAdd.slice(0, remaining)

    if (toAdd.length > remaining) {
      const skipped = toAdd.length - remaining
      errs.push(`Limite de ${maxPhotos} fotos atingido — ${skipped} foto${skipped !== 1 ? 's' : ''} ignorada${skipped !== 1 ? 's' : ''}.`)
    }

    setErrors(errs)
    if (inputRef.current) inputRef.current.value = ''
    if (willAdd.length === 0) return

    let loaded = 0
    const results: string[] = new Array(willAdd.length)

    willAdd.forEach((file, i) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        results[i] = ev.target?.result as string
        loaded++
        if (loaded === willAdd.length) {
          onChange([...photos, ...results])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  function removePhoto(idx: number) {
    setErrors([])
    onChange(photos.filter((_, i) => i !== idx))
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[12px] font-medium text-[#475569]">{label}</p>
        {sublabel && <p className="mt-0.5 text-[11px] text-[#94A3B8]">{sublabel}</p>}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((src, idx) => (
          <div
            key={idx}
            className="group relative aspect-square overflow-hidden rounded-lg border border-[#E2E8F0]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`Foto ${idx + 1}`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-150 group-hover:bg-black/40 motion-reduce:transition-none">
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                aria-label={`Remover foto ${idx + 1}`}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#0F172A] shadow',
                  'opacity-0 transition-opacity duration-150 group-hover:opacity-100',
                  'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
                  'motion-reduce:transition-none',
                )}
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            aria-label="Adicionar foto"
            className={cn(
              'flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-[#E2E8F0] text-[#94A3B8]',
              'transition-colors duration-150 hover:border-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DBEAFE]',
              'motion-reduce:transition-none',
            )}
          >
            <Camera size={20} aria-hidden="true" />
            <span className="text-[11px] font-medium leading-none">Adicionar</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        aria-label={`Selecionar ${label.toLowerCase()}`}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {errors.length > 0 && (
        <ul className="space-y-1" role="alert" aria-live="polite">
          {errors.map((err, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#DC2626]">
              <span aria-hidden="true">•</span>
              {err}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-[#94A3B8]">
        JPG, PNG, WEBP · Máx. {maxSizeMB}MB por foto · Até {maxPhotos} fotos
      </p>
    </div>
  )
}
