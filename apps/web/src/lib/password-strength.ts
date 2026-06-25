export interface PasswordStrength {
  score: number          // 1..4, drives how many bar segments light up
  label: string          // 'fraca' | 'média' | 'forte' | 'muito forte'
  color: string          // hex used for the bar + label
}

export function passwordStrength(password: string): PasswordStrength {
  const longEnough = password.length >= 8
  const hasNumber  = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (!longEnough) {
    return { score: 1, label: 'fraca', color: '#EF4444' }
  }
  if (hasNumber && hasSpecial) {
    return { score: 4, label: 'muito forte', color: '#10B981' }
  }
  if (hasNumber || hasSpecial) {
    return { score: 3, label: 'forte', color: '#2563EB' }
  }
  return { score: 2, label: 'média', color: '#EAB308' }
}
