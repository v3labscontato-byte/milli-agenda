'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'pwa-install-dismissed'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) return
    if (localStorage.getItem(STORAGE_KEY)) return

    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!visible || !prompt) return null

  const handleInstall = async () => {
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      localStorage.setItem(STORAGE_KEY, '1')
    }
    setVisible(false)
  }

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <div
      className="flex shrink-0 items-center justify-between gap-2 px-4 py-2 text-white"
      style={{ backgroundColor: '#81736f', minHeight: 44 }}
    >
      <span className="text-[13px] font-medium">📱 Instale o app para acesso rápido</span>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="rounded-full bg-white px-3 py-1 text-[12px] font-semibold transition-transform duration-100 active:scale-95"
          style={{ color: '#81736f' }}
        >
          Instalar
        </button>
        <button
          onClick={handleDismiss}
          className="text-[20px] leading-none text-white/70 active:scale-95"
          aria-label="Fechar banner"
        >
          ×
        </button>
      </div>
    </div>
  )
}
