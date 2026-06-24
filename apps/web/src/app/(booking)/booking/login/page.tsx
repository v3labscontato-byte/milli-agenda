'use client'

import { useRouter } from 'next/navigation'
import AuthScreen from '@/components/booking/auth-screen'

export default function LoginPage() {
  const router = useRouter()
  return <AuthScreen onSuccess={() => router.push('/booking')} />
}
