// ============================================================
// core/seo — seoService 단위 테스트
// ============================================================

import { describe, it, expect } from 'vitest'
import { seoService } from '@core/seo/seo.service'
import type { SiteConfig, Content } from '@/types'

const mockSite: SiteConfig = {
  siteId: 's1',
  slug: 'baikalsys',
  name: 'Baikal Systems',
  domain: 'baikalsys.com',
  type: 'corporate',
  templateId: 'corporate',
  modules: [],
  locale: 'ko',
  timezone: 'Asia/Seoul',
  meta: {
    title: 'Baikal Systems',
    description: '기업 홈페이지',
    keywords: ['baikal'],
    ogImage: null,
    favicon: null,
  },
  features: {
    blog: true,
    portfolio: false,
    contact: true,
    booking: false,
    ecommerce: false,
    mediaHub: false,
  },
}

const mockContent: Content = {
  id: 'c1',
  siteId: 's1',
  type: 'post',
  slug: 'hello-world',
  title: '첫 번째 포스트',
  body: null,
  status: 'published',
  authorId: 'u1',
  publishedAt: '2026-01-01T00:00:00Z',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  meta: {
    title: 'SEO 제목',
    description: 'SEO 설명',
    ogImage: 'https://cdn.example.com/og.jpg',
    tags: [],
    topics: [],
  },
}

describe('seoService.buildMeta', () => {
  it('콘텐츠 없는 경우 사이트 기본 메타를 반환한다', () => {
    const meta = seoService.buildMeta({ site: mockSite, path: '/' })
    expect(meta.title).toBe('Baikal Systems')
    expect(meta.description).toBe('기업 홈페이지')
    expect(meta.noIndex).toBe(false)
    expect(meta.canonical).toBe('https://baikalsys.com/')
  })

  it('콘텐츠의 meta.title이 site 제목을 override한다', () => {
    const meta = seoService.buildMeta({
      site: mockSite,
      content: mockContent,
      path: '/blog/hello-world',
    })
    expect(meta.title).toBe('SEO 제목')
    expect(meta.ogImage).toBe('https://cdn.example.com/og.jpg')
  })

  it('draft 콘텐츠는 noIndex=true', () => {
    const draft = { ...mockContent, status: 'draft' as const }
    const meta = seoService.buildMeta({ site: mockSite, content: draft })
    expect(meta.noIndex).toBe(true)
  })
})

describe('seoService.buildRobotsTxt', () => {
  it('/admin/ 비허용 지시어를 포함한다', () => {
    const txt = seoService.buildRobotsTxt(mockSite)
    expect(txt).toContain('Disallow: /admin/')
    expect(txt).toContain('Sitemap: https://baikalsys.com/sitemap.xml')
  })
})
