// ============================================================
// core/settings — Site Settings Service
//
// 책임:
//   - site slug / domain으로 SiteConfig 로드
//   - site_settings 테이블 CRUD
//   - 설정 캐싱 (메모리)
//
// 의존: lib/supabase
// 비종속: 특정 site 하드코딩 없음
// ============================================================

import type { SiteConfig, ApiResult } from '@/types'
import { supabase } from '@lib/supabase'

// local config fallback (개발 환경 / DB 없을 때)
import { baikalsysConfig } from '@sites/baikalsys/site.config'
import { demoSiteConfig } from '@sites/demo-site/site.config'

const LOCAL_CONFIGS: Record<string, SiteConfig> = {
  baikalsys: baikalsysConfig,
  'demo-site': demoSiteConfig,
}

// ------ In-memory cache ------

const cache = new Map<string, SiteConfig>()

// ------ Service ------

export const settingsService = {
  /**
   * slug로 SiteConfig 로드. 결과를 메모리에 캐싱.
   */
  async loadSiteConfig(slug: string): Promise<ApiResult<SiteConfig>> {
    if (cache.has(slug)) return { data: cache.get(slug)!, error: null }

    let dbData: Record<string, unknown> | null = null
    let dbError: { message: string } | null = null

    try {
      const { data, error } = await supabase
        .from('sites')
        .select(
          `
          id,
          slug,
          name,
          domain,
          type,
          template_id,
          status,
          site_settings (
            locale,
            timezone,
            meta,
            feature_flags,
            modules
          )
        `,
        )
        .eq('slug', slug)
        .eq('status', 'active')
        .maybeSingle()

      dbData = data as Record<string, unknown> | null
      dbError = error
    } catch (e) {
      // supabase 쿼리가 예외를 던진 경우 (네트워크 오류, schema 불일치 등)
      dbError = { message: e instanceof Error ? e.message : 'DB query failed' }
    }

    if (dbError || !dbData) {
      // DB 실패 시 로컬 config fallback (개발 환경)
      const local = LOCAL_CONFIGS[slug]
      if (local) {
        cache.set(slug, local)
        return { data: local, error: null }
      }
      return {
        data: null,
        error: { code: 'SITE_NOT_FOUND', message: dbError?.message ?? 'Site not found' },
      }
    }

    const settings = Array.isArray(dbData.site_settings)
      ? (dbData.site_settings as Record<string, unknown>[])[0]
      : dbData.site_settings as Record<string, unknown> | null

    const config: SiteConfig = {
      siteId: dbData.id as string,
      slug: dbData.slug as string,
      name: dbData.name as string,
      domain: (dbData.domain as string) ?? '',
      type: dbData.type as SiteConfig['type'],
      templateId: dbData.template_id as string,
      modules: (settings?.modules as string[]) ?? [],
      locale: (settings?.locale as string) ?? 'ko',
      timezone: (settings?.timezone as string) ?? 'Asia/Seoul',
      meta: (settings?.meta as SiteConfig['meta']) ?? {
        title: dbData.name as string,
        description: '',
        keywords: [],
        ogImage: null,
        favicon: null,
      },
      features: (settings?.feature_flags as SiteConfig['features']) ?? {
        blog: false,
        portfolio: false,
        contact: false,
        booking: false,
        ecommerce: false,
        mediaHub: false,
      },
    }

    cache.set(slug, config)
    return { data: config, error: null }
  },

  /**
   * 캐시를 무효화합니다 (설정 변경 후 호출).
   */
  invalidateCache(slug: string) {
    cache.delete(slug)
  },

  /**
   * site_settings 테이블 부분 업데이트.
   */
  async updateSiteSettings(
    siteId: string,
    patch: Partial<Pick<SiteConfig, 'meta' | 'features' | 'locale' | 'timezone' | 'modules'>>,
  ): Promise<ApiResult<void>> {
    const { error } = await supabase
      .from('site_settings')
      .update({
        ...(patch.locale && { locale: patch.locale }),
        ...(patch.timezone && { timezone: patch.timezone }),
        ...(patch.meta && { meta: patch.meta }),
        ...(patch.features && { feature_flags: patch.features }),
        ...(patch.modules && { modules: patch.modules }),
      })
      .eq('site_id', siteId)

    if (error) {
      return { data: null, error: { code: 'UPDATE_FAILED', message: error.message } }
    }
    return { data: null, error: null }
  },
}
