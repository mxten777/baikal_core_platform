// ============================================================
// core/auth — Authentication & Authorization Service
//
// 책임:
//   - Supabase Auth 래핑 (로그인/로그아웃/회원가입)
//   - AuthUser 세션 관리
//   - 역할 기반 권한 검사 (RBAC)
//
// 의존: lib/supabase
// 비종속: 특정 site 로직 없음
// ============================================================

import type { AuthUser, AuthSession, UserRole, ApiResult } from '@/types'
import { supabase } from '@lib/supabase'
import type { Session } from '@supabase/supabase-js'

// ------ Internal helpers ------

function mapSession(session: Session): AuthSession {
  const meta = session.user.user_metadata as Record<string, unknown>
  const appMeta = session.user.app_metadata as Record<string, unknown>
  return {
    user: {
      id: session.user.id,
      email: session.user.email ?? '',
      name: (meta.name as string) ?? null,
      avatarUrl: (meta.avatar_url as string) ?? null,
      role: ((appMeta.role ?? meta.role) as UserRole) ?? 'viewer',
      siteId: ((appMeta.site_id ?? meta.site_id) as string) ?? null,
    },
    accessToken: session.access_token,
    expiresAt: session.expires_at ?? 0,
  }
}

// ------ Service ------

export const authService = {
  async getCurrentUser(): Promise<ApiResult<AuthUser>> {
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session) return { data: null, error: null }
    return { data: mapSession(data.session).user, error: null }
  },

  async signIn(
    email: string,
    password: string,
  ): Promise<ApiResult<AuthSession>> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error || !data.session) {
      return {
        data: null,
        error: { code: 'AUTH_FAILED', message: error?.message ?? 'Sign in failed' },
      }
    }
    return { data: mapSession(data.session), error: null }
  },

  async signOut(): Promise<ApiResult<void>> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { data: null, error: { code: 'SIGN_OUT_FAILED', message: error.message } }
    }
    return { data: null, error: null }
  },

  /**
   * 현재 사용자가 요청 역할 이상인지 확인.
   * 역할 계층: platform_admin > site_admin > editor > viewer
   */
  hasRole(user: AuthUser | null, required: UserRole): boolean {
    if (!user) return false
    const hierarchy: UserRole[] = ['viewer', 'editor', 'site_admin', 'platform_admin']
    return hierarchy.indexOf(user.role) >= hierarchy.indexOf(required)
  },

  /**
   * user가 siteId에 접근 가능한지 확인.
   * platform_admin은 모든 사이트에 접근 가능.
   */
  canAccessSite(user: AuthUser | null, siteId: string): boolean {
    if (!user) return false
    if (user.role === 'platform_admin') return true
    return user.siteId === siteId
  },

  /**
   * Supabase Auth 상태 변경 구독.
   * 반환값은 unsubscribe 함수.
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        callback(mapSession(session).user)
      } else {
        callback(null)
      }
    })
    return () => data.subscription.unsubscribe()
  },
}
