// ============================================================
// core/auth — useAuth Hook
// ============================================================

import { useEffect, useState } from 'react'
import type { AuthUser } from '@/types'
import { authService } from './auth.service'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 초기 세션 로드
    authService.getCurrentUser().then(({ data }) => {
      setUser(data)
      setLoading(false)
    })

    // 실시간 상태 변경 구독
    const unsubscribe = authService.onAuthStateChange((u) => {
      setUser(u)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn: authService.signIn,
    signOut: authService.signOut,
    hasRole: (role: Parameters<typeof authService.hasRole>[1]) =>
      authService.hasRole(user, role),
  }
}
