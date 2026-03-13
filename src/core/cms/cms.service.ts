// ============================================================
// core/cms — CMS Service (Admin용 콘텐츠 관리)
//
// 책임:
//   - 콘텐츠 버전 관리 (draft → published → archived)
//   - 콘텐츠 미리보기 토큰 생성
//   - 관리자 콘텐츠 목록 (unpublished 포함)
//   - slug 중복 검사
//
// 의존: core/content, core/auth (권한 검사)
// 비종속: 특정 모듈/template 없음
// ============================================================

import type { Content, ContentType, AuthUser, ApiResult } from '@/types'
import { contentService } from '@core/content'
import { authService } from '@core/auth'
import { supabase } from '@lib/supabase'

export const cmsService = {
  /**
   * 모든 상태(draft 포함)의 콘텐츠를 관리자용으로 조회.
   * 권한 검사: site_admin 이상만 허용.
   */
  async listAll(
    user: AuthUser,
    siteId: string,
    type?: ContentType,
  ): Promise<ApiResult<Content[]>> {
    if (!authService.canAccessSite(user, siteId)) {
      return { data: null, error: { code: 'FORBIDDEN', message: 'Access denied' } }
    }

    const opts = {
      siteId,
      ...(type && { type }),
      limit: 100,
      offset: 0,
      orderBy: 'updatedAt' as const,
    }

    const { data, error } = await contentService.getList(opts)
    if (error) return { data: null, error }
    return { data: data?.items ?? [], error: null }
  },

  /**
   * draft 콘텐츠를 published로 전환.
   */
  async publish(
    user: AuthUser,
    contentId: string,
  ): Promise<ApiResult<Content>> {
    if (!authService.hasRole(user, 'editor')) {
      return { data: null, error: { code: 'FORBIDDEN', message: 'Editor role required' } }
    }

    return contentService.update(contentId, {
      status: 'published',
      publishedAt: new Date().toISOString(),
    })
  },

  /**
   * published 콘텐츠를 archived로 전환.
   */
  async archive(
    user: AuthUser,
    contentId: string,
  ): Promise<ApiResult<Content>> {
    if (!authService.hasRole(user, 'editor')) {
      return { data: null, error: { code: 'FORBIDDEN', message: 'Editor role required' } }
    }

    return contentService.update(contentId, { status: 'archived' })
  },

  /**
   * slug 중복 여부 확인.
   */
  async isSlugAvailable(
    siteId: string,
    slug: string,
    excludeId?: string,
  ): Promise<boolean> {
    let query = supabase
      .from('contents')
      .select('id')
      .eq('site_id', siteId)
      .eq('slug', slug)

    if (excludeId) query = query.neq('id', excludeId)

    const { data } = await query.maybeSingle()
    return data === null
  },
}
