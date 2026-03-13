// ============================================================
// modules/blog — Blog Service
//
// 책임: blog post 목록/단건 조회
// 의존: core/content (contentService)
// ============================================================

import { contentService } from '@core/content'
import type { ApiResult } from '@/types'
import type { BlogPost, BlogListOptions } from '../types/blog.types'

export const blogService = {
  async getPosts(
    opts: BlogListOptions,
  ): Promise<ApiResult<{ items: BlogPost[]; total: number }>> {
    const pageSize = opts.pageSize ?? 10
    const offset = ((opts.page ?? 1) - 1) * pageSize

    const { data, error } = await contentService.getList({
      siteId: opts.siteId,
      type: 'post',
      status: 'published',
      tag: opts.tag,
      topic: opts.topic,
      limit: pageSize,
      offset,
      orderBy: 'publishedAt',
    })

    if (error) return { data: null, error }
    return {
      data: {
        items: (data?.items ?? []) as BlogPost[],
        total: data?.total ?? 0,
      },
      error: null,
    }
  },

  async getPostBySlug(
    siteId: string,
    slug: string,
  ): Promise<ApiResult<BlogPost>> {
    const { data, error } = await contentService.getBySlug(siteId, slug)
    if (error || !data) return { data: null, error: error ?? { code: 'NOT_FOUND', message: 'Post not found' } }
    return { data: data as BlogPost, error: null }
  },
}
