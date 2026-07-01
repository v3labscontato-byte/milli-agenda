'use client'

import { useState, useEffect } from 'react'

export interface BookingClientInfo {
  id: string
  name: string
  phone: string
  email?: string | null
}

const SESSION_KEY = 'booking_client'

export function useBookingClient() {
  const [client, setClientState] = useState<BookingClientInfo | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      if (raw) setClientState(JSON.parse(raw) as BookingClientInfo)
    } catch { /* ignore */ }
    setReady(true)
  }, [])

  function setClient(c: BookingClientInfo) {
    setClientState(c)
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(c)) } catch { /* ignore */ }
  }

  function clearClient() {
    setClientState(null)
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  }

  return { client, setClient, clearClient, ready }
}
