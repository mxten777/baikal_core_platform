// ============================================================
// core/settings — settingsService local fallback 통합 테스트
//
// DB 조회 실패 시 LOCAL_CONFIGS에서 설정을 가져오는 동작 검증.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Supabase mock
const mockMaybeSingle = vi.fn()
vi.mock('@lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: () => mockMaybeSingle(),
          }),
        }),
      }),
    }),
  },
}))

import { settingsService } from '@core/settings/settings.service'

// 각 테스트 전 캐시 초기화 (이전 테스트 결과가 누적되지 않도록)
beforeEach(() => {
  settingsService.invalidateCache('baikalsys')
  settingsService.invalidateCache('demo-site')
  settingsService.invalidateCache('non-existent-site')
  vi.clearAllMocks()
})

// 서비스가 기대하는 Supabase 응답 구조
const DB_ROW = {
  id: 'db-site-id',
  name: 'DB Site',
  slug: 'baikalsys',
  domain: 'baikalsys.com',
  type: 'corporate',
  status: 'active',
  template_id: 'corporate',
  site_settings: [
    {
      locale: 'ko',
      timezone: 'Asia/Seoul',
      modules: ['blog', 'contact'],
      meta: {
        title: 'DB Site',
        description: '',
        keywords: [],
        ogImage: null,
        favicon: null,
      },
      feature_flags: {
        blog: true,
        portfolio: false,
        contact: true,
        booking: false,
        ecommerce: false,
        mediaHub: false,
      },
    },
  ],
}

describe('settingsService.loadSiteConfig', () => {
  it('DB 조회 성공 시 DB 데이터를 반환한다', async () => {
    mockMaybeSingle.mockResolvedValue({ data: DB_ROW, error: null })

    const result = await settingsService.loadSiteConfig('baikalsys')

    expect(result.error).toBeNull()
    expect(result.data?.name).toBe('DB Site')
    expect(result.data?.siteId).toBe('db-site-id')
    expect(result.data?.templateId).toBe('corporate')
    expect(result.data?.modules).toContain('blog')
  })

  it('DB 조회 실패 시 LOCAL_CONFIGS fallback을 사용한다', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'Connection refused' },
    })

    const result = await settingsService.loadSiteConfig('baikalsys')

    // baikalsys site.config.ts가 있으므로 성공해야 한다
    expect(result.error).toBeNull()
    expect(result.data?.slug).toBe('baikalsys')
  })

  it('DB 실패 + local fallback도 없으면 에러를 반환한다', async () => {
    mockMaybeSingle.mockResolvedValue({
      data: null,
      error: { message: 'Connection refused' },
    })

    const result = await settingsService.loadSiteConfig('non-existent-site')

    expect(result.data).toBeNull()
    expect(result.error).not.toBeNull()
    expect(result.error?.code).toBe('SITE_NOT_FOUND')
  })

  it('캐시된 설정은 DB를 다시 호출하지 않는다', async () => {
    mockMaybeSingle.mockResolvedValue({ data: DB_ROW, error: null })

    // 첫 번째 호출 — DB 조회
    await settingsService.loadSiteConfig('baikalsys')
    // 두 번째 호출 — 캐시 사용
    const cached = await settingsService.loadSiteConfig('baikalsys')

    expect(cached.data?.name).toBe('DB Site')
    expect(mockMaybeSingle).toHaveBeenCalledTimes(1) // DB는 한 번만 호출
  })
})

