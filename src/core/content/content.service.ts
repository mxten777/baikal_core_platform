// ============================================================
// core/content — Content Engine Service
//
// 책임:
//   - contents 테이블 CRUD
//   - 콘텐츠 목록 쿼리 (페이지네이션, 필터, 정렬)
//   - 슬러그 기반 단일 콘텐츠 조회
//   - draft/published 상태 관리
//
// 의존: lib/supabase
// 비종속: 특정 모듈(blog, portfolio 등)에 의존하지 않음.
//         각 모듈이 이 service를 사용한다.
// ============================================================

import type { Content, ContentType, ContentStatus, ApiResult } from '@/types'
import { supabase } from '@lib/supabase'

// ------ Query Options ------

export interface ContentListOptions {
  siteId: string
  type?: ContentType
  status?: ContentStatus
  tag?: string
  topic?: string
  limit?: number
  offset?: number
  orderBy?: 'publishedAt' | 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}

export interface ContentListResult {
  items: Content[]
  total: number
}

// ------ Service ------

export const contentService = {
  async getList(opts: ContentListOptions): Promise<ApiResult<ContentListResult>> {
    let query = supabase
      .from('contents')
      .select('*', { count: 'exact' })
      .eq('site_id', opts.siteId)

    if (opts.type) query = query.eq('type', opts.type)
    if (opts.status) query = query.eq('status', opts.status)
    if (opts.tag) query = query.contains('meta->tags', [opts.tag])
    if (opts.topic) query = query.contains('meta->topics', [opts.topic])

    const orderCol =
      opts.orderBy === 'publishedAt'
        ? 'published_at'
        : opts.orderBy === 'updatedAt'
          ? 'updated_at'
          : 'created_at'

    query = query
      .order(orderCol, { ascending: opts.order === 'asc' })
      .range(opts.offset ?? 0, (opts.offset ?? 0) + (opts.limit ?? 10) - 1)

    const { data, error, count } = await query

    if (error) {
      return { data: null, error: { code: 'CONTENT_LIST_FAILED', message: error.message } }
    }

    return {
      data: { items: (data as Content[]) ?? [], total: count ?? 0 },
      error: null,
    }
  },

  async getBySlug(
    siteId: string,
    slug: string,
    status: ContentStatus = 'published',
  ): Promise<ApiResult<Content>> {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('site_id', siteId)
      .eq('slug', slug)
      .eq('status', status)
      .single()

    if (error || !data) {
      return {
        data: null,
        error: { code: 'CONTENT_NOT_FOUND', message: error?.message ?? 'Not found' },
      }
    }
    return { data: data as Content, error: null }
  },

  async getById(id: string): Promise<ApiResult<Content>> {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return {
        data: null,
        error: { code: 'CONTENT_NOT_FOUND', message: error?.message ?? 'Not found' },
      }
    }
    return { data: data as Content, error: null }
  },

  async create(
    payload: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<ApiResult<Content>> {
    const { data, error } = await supabase
      .from('contents')
      .insert({
        site_id: payload.siteId,
        type: payload.type,
        slug: payload.slug,
        title: payload.title,
        body: payload.body,
        status: payload.status,
        author_id: payload.authorId,
        published_at: payload.publishedAt,
        meta: payload.meta,
      })
      .select()
      .single()

    if (error || !data) {
      return { data: null, error: { code: 'CREATE_FAILED', message: error?.message ?? 'Create failed' } }
    }
    return { data: data as Content, error: null }
  },

  async update(
    id: string,
    patch: Partial<Pick<Content, 'title' | 'body' | 'status' | 'meta' | 'publishedAt'>>,
  ): Promise<ApiResult<Content>> {
    const { data, error } = await supabase
      .from('contents')
      .update({
        ...(patch.title && { title: patch.title }),
        ...(patch.body !== undefined && { body: patch.body }),
        ...(patch.status && { status: patch.status }),
        ...(patch.meta && { meta: patch.meta }),
        ...(patch.publishedAt !== undefined && { published_at: patch.publishedAt }),
      })
      .eq('id', id)
      .select()
      .single()

    if (error || !data) {
      return { data: null, error: { code: 'UPDATE_FAILED', message: error?.message ?? 'Update failed' } }
    }
    return { data: data as Content, error: null }
  },

  async delete(id: string): Promise<ApiResult<void>> {
    const { error } = await supabase.from('contents').delete().eq('id', id)
    if (error) {
      return { data: null, error: { code: 'DELETE_FAILED', message: error.message } }
    }
    return { data: null, error: null }
  },
}
