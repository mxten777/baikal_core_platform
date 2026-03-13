// ============================================================
// core/runtime — resolveSiteSlug 단위 테스트
// ============================================================

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { resolveSiteSlug } from '@core/runtime/RuntimeProvider'

describe('resolveSiteSlug', () => {
  beforeEach(() => {
    // window.location 초기화
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
        search: '',
        href: 'http://localhost/',
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('쿼리 파라미터 ?site=demo를 최우선으로 반환한다', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'localhost', search: '?site=demo', href: '' },
      writable: true,
    })
    expect(resolveSiteSlug()).toBe('demo')
  })

  it('localhost에서는 VITE_DEFAULT_SITE 기본값을 반환한다', () => {
    vi.stubEnv('VITE_DEFAULT_SITE', 'test-site')
    expect(resolveSiteSlug()).toBe('test-site')
  })

  it('서브도메인 hostname에서 첫 번째 파트를 slug로 반환한다', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'baikalsys.baikal.com', search: '', href: '' },
      writable: true,
    })
    expect(resolveSiteSlug()).toBe('baikalsys')
  })

  it('apex domain에서 첫 번째 파트를 slug로 반환한다', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'baikalsys.com', search: '', href: '' },
      writable: true,
    })
    expect(resolveSiteSlug()).toBe('baikalsys')
  })

  it('www. 접두사를 제거하고 slug를 반환한다', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'www.baikalsys.com', search: '', href: '' },
      writable: true,
    })
    expect(resolveSiteSlug()).toBe('baikalsys')
  })
})
