// ============================================================
// modules/blog — blogService 단위 테스트
//
// contentService를 mock하여 blogService 로직 검증.
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import type { Content } from '@/types'

// contentService mock
const mockGetList = vi.fn()
const mockGetBySlug = vi.fn()

vi.mock('@core/content', () => ({
  contentService: {
    getList: (...args: unknown[]) => mockGetList(...args),
    getBySlug: (...args: unknown[]) => mockGetBySlug(...args),
  },
}))

import { blogService } from '@modules/blog/services/blog.service'

function makePost(slug: string): Content {
  return {
    id: `id-${slug}`,
    siteId: 'site-1',
    type: 'post',
    slug,
    title: `Post: ${slug}`,
    body: 'body content',
    status: 'published',
    authorId: 'user-1',
    publishedAt: '2024-01-01T00:00:00Z',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    meta: { title: null, description: null, ogImage: null, tags: [], topics: [] },
  }
}

describe('blogService.getPosts', () => {
  it('contentService.getList를 post 타입으로 호출한다', async () => {
    const items = [makePost('post-1'), makePost('post-2')]
    mockGetList.mockResolvedValue({ data: { items, total: 2 }, error: null })

    const result = await blogService.getPosts({ siteId: 'site-1', page: 1, pageSize: 10 })

    expect(result.error).toBeNull()
    expect(result.data?.total).toBe(2)
    expect(result.data?.items).toHaveLength(2)

    expect(mockGetList).toHaveBeenCalledWith(
      expect.objectContaining({
        siteId: 'site-1',
        type: 'post',
        status: 'published',
        limit: 10,
        offset: 0,
      }),
    )
  })

  it('page=2면 offset이 pageSize만큼 이동한다', async () => {
    mockGetList.mockResolvedValue({ data: { items: [], total: 20 }, error: null })

    await blogService.getPosts({ siteId: 'site-1', page: 2, pageSize: 5 })

    expect(mockGetList).toHaveBeenCalledWith(
      expect.objectContaining({ offset: 5, limit: 5 }),
    )
  })

  it('contentService 에러 시 에러를 그대로 반환한다', async () => {
    mockGetList.mockResolvedValue({
      data: null,
      error: { code: 'DB_ERROR', message: 'Connection failed' },
    })

    const result = await blogService.getPosts({ siteId: 'site-1' })

    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('DB_ERROR')
  })
})

describe('blogService.getPostBySlug', () => {
  it('slug로 포스트를 조회한다', async () => {
    const post = makePost('hello-world')
    mockGetBySlug.mockResolvedValue({ data: post, error: null })

    const result = await blogService.getPostBySlug('site-1', 'hello-world')

    expect(result.error).toBeNull()
    expect(result.data?.slug).toBe('hello-world')
    expect(mockGetBySlug).toHaveBeenCalledWith('site-1', 'hello-world')
  })

  it('존재하지 않는 slug는 에러를 반환한다', async () => {
    mockGetBySlug.mockResolvedValue({
      data: null,
      error: { code: 'CONTENT_NOT_FOUND', message: 'Not found' },
    })

    const result = await blogService.getPostBySlug('site-1', 'non-existent')

    expect(result.data).toBeNull()
    expect(result.error?.code).toBe('CONTENT_NOT_FOUND')
  })
})
