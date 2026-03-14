// ============================================================
// core/settings — Site Provisioning Service
//
// 책임:
//   - 신규 고객사 사이트를 DB에 자동 등록 (platform_admin 전용)
//   - Organization → Site → SiteSettings 순서로 트랜잭션 처리
//   - slug 중복 검사
//   - 실패 시 생성된 Site 롤백 (best-effort)
//
// 의존: lib/supabase
// 권한: platform_admin만 호출 가능 (RLS 005_provisioning_rls.sql)
// ============================================================

import type { ApiResult, SiteType } from '@/types'
import { supabase } from '@lib/supabase'

// ------ Input / Result types ------

export interface ProvisionSiteInput {
  // Organization
  orgName: string          // 고객사 이름 (예: ABC 컴퍼니)
  orgSlug: string          // 조직 slug (소문자·하이픈)

  // Site
  siteName: string         // 사이트 표시 이름
  siteSlug: string         // 사이트 slug (URL 식별자)
  domain: string           // 도메인 (없으면 빈 문자열)
  type: SiteType           // 사이트 유형
  templateId: string       // 템플릿 ID

  // Settings
  modules: string[]        // 활성화할 모듈 ID 목록
  locale: string
  timezone: string
  meta: {
    title: string
    description: string
    keywords: string[]
    ogImage: string | null
    favicon: string | null
  }
}

export interface ProvisionSiteResult {
  orgId: string
  siteId: string
  siteSlug: string
}

// ------ Service ------

export const provisioningService = {
  /**
   * 신규 사이트를 DB에 등록한다.
   *
   * 순서:
   *  1. orgSlug로 기존 Organization 조회 → 없으면 생성
   *  2. siteSlug 중복 확인
   *  3. Site 생성
   *  4. SiteSettings 생성 (실패 시 Site 롤백)
   */
  async provisionSite(
    input: ProvisionSiteInput,
  ): Promise<ApiResult<ProvisionSiteResult>> {
    // 1. Organization — 기존 조직 재사용 또는 신규 생성
    const { data: existingOrg, error: orgSelectErr } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', input.orgSlug)
      .maybeSingle()

    if (orgSelectErr) {
      return {
        data: null,
        error: { code: 'ORG_QUERY_FAILED', message: orgSelectErr.message },
      }
    }

    let orgId: string

    if (existingOrg) {
      orgId = existingOrg.id as string
    } else {
      const { data: newOrg, error: orgInsertErr } = await supabase
        .from('organizations')
        .insert({ name: input.orgName, slug: input.orgSlug })
        .select('id')
        .single()

      if (orgInsertErr || !newOrg) {
        return {
          data: null,
          error: {
            code: 'ORG_CREATE_FAILED',
            message: orgInsertErr?.message ?? 'Organization 생성 실패',
          },
        }
      }
      orgId = (newOrg as { id: string }).id
    }

    // 2. siteSlug 중복 검사
    const { data: existingSite, error: slugCheckErr } = await supabase
      .from('sites')
      .select('id')
      .eq('slug', input.siteSlug)
      .maybeSingle()

    if (slugCheckErr) {
      return {
        data: null,
        error: { code: 'SLUG_CHECK_FAILED', message: slugCheckErr.message },
      }
    }

    if (existingSite) {
      return {
        data: null,
        error: {
          code: 'SLUG_DUPLICATE',
          message: `slug "${input.siteSlug}"는 이미 사용 중입니다.`,
        },
      }
    }

    // 3. Site 생성
    const { data: newSite, error: siteInsertErr } = await supabase
      .from('sites')
      .insert({
        organization_id: orgId,
        slug: input.siteSlug,
        domain: input.domain || null,
        name: input.siteName,
        type: input.type,
        status: 'active',
        template_id: input.templateId,
      })
      .select('id')
      .single()

    if (siteInsertErr || !newSite) {
      return {
        data: null,
        error: {
          code: 'SITE_CREATE_FAILED',
          message: siteInsertErr?.message ?? 'Site 생성 실패',
        },
      }
    }

    const siteId = (newSite as { id: string }).id

    // feature_flags를 modules 배열에서 자동 생성
    const featureFlags = {
      blog: input.modules.includes('blog'),
      portfolio: input.modules.includes('portfolio'),
      contact: input.modules.includes('contact'),
      booking: input.modules.includes('booking'),
      ecommerce: input.modules.includes('ecommerce'),
      mediaHub: input.modules.includes('mediaHub'),
    }

    // 4. SiteSettings 생성
    const { error: settingsInsertErr } = await supabase
      .from('site_settings')
      .insert({
        site_id: siteId,
        locale: input.locale,
        timezone: input.timezone,
        modules: input.modules,
        meta: input.meta,
        feature_flags: featureFlags,
      })

    if (settingsInsertErr) {
      // 롤백: 생성된 Site 삭제 (best-effort)
      await supabase.from('sites').delete().eq('id', siteId)
      return {
        data: null,
        error: {
          code: 'SETTINGS_CREATE_FAILED',
          message: settingsInsertErr.message,
        },
      }
    }

    return {
      data: { orgId, siteId, siteSlug: input.siteSlug },
      error: null,
    }
  },

  /**
   * 등록된 모든 사이트 목록 조회 (platform_admin용).
   */
  async listAllSites(): Promise<
    ApiResult<{ id: string; slug: string; name: string; type: string; status: string; domain: string | null }[]>
  > {
    const { data, error } = await supabase
      .from('sites')
      .select('id, slug, name, type, status, domain')
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: { code: 'LIST_FAILED', message: error.message } }
    }

    return { data: data as { id: string; slug: string; name: string; type: string; status: string; domain: string | null }[], error: null }
  },
}
