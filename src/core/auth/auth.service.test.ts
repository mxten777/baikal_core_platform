// ============================================================
// core/auth — authService.hasRole / canAccessSite 단위 테스트
// ============================================================

import { describe, it, expect } from 'vitest'
import { authService } from '@core/auth/auth.service'
import type { AuthUser } from '@/types'

function makeUser(role: AuthUser['role'], siteId?: string): AuthUser {
  return {
    id: 'u1',
    email: 'test@example.com',
    name: null,
    avatarUrl: null,
    role,
    siteId: siteId ?? null,
  }
}

describe('authService.hasRole', () => {
  it('null user는 항상 false', () => {
    expect(authService.hasRole(null, 'viewer')).toBe(false)
  })

  it('platform_admin은 모든 역할 통과', () => {
    const user = makeUser('platform_admin')
    expect(authService.hasRole(user, 'viewer')).toBe(true)
    expect(authService.hasRole(user, 'editor')).toBe(true)
    expect(authService.hasRole(user, 'site_admin')).toBe(true)
    expect(authService.hasRole(user, 'platform_admin')).toBe(true)
  })

  it('viewer는 editor 이상 요구 시 false', () => {
    const user = makeUser('viewer')
    expect(authService.hasRole(user, 'editor')).toBe(false)
    expect(authService.hasRole(user, 'site_admin')).toBe(false)
  })

  it('editor는 editor 통과, site_admin 미통과', () => {
    const user = makeUser('editor')
    expect(authService.hasRole(user, 'viewer')).toBe(true)
    expect(authService.hasRole(user, 'editor')).toBe(true)
    expect(authService.hasRole(user, 'site_admin')).toBe(false)
  })
})

describe('authService.canAccessSite', () => {
  it('null user는 false', () => {
    expect(authService.canAccessSite(null, 'site-1')).toBe(false)
  })

  it('platform_admin은 모든 사이트 접근 가능', () => {
    const user = makeUser('platform_admin')
    expect(authService.canAccessSite(user, 'any-site')).toBe(true)
  })

  it('site_admin은 자신의 사이트만 접근 가능', () => {
    const user = makeUser('site_admin', 'site-1')
    expect(authService.canAccessSite(user, 'site-1')).toBe(true)
    expect(authService.canAccessSite(user, 'site-2')).toBe(false)
  })
})
