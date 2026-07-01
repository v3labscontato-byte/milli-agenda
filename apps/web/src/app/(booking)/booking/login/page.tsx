'use client'

import { useBookingClient, type BookingClientInfo } from '@/hooks/use-booking-client'
import { usePublicTenant } from '@/hooks/use-public-tenant'
import PhoneIdentify from '@/components/booking/phone-identify'

export default function LoginPage() {
  const { setClient } = useBookingClient()
  const { tenant } = usePublicTenant()

  function handleFound(c: BookingClientInfo) {
    setClient(c)
    // Hard reload so the layout re-reads sessionStorage with the new client
    window.location.replace('/booking')
  }

  return <PhoneIdentify onFound={handleFound} tenant={tenant} />
}
