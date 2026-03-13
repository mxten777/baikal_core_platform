// ============================================================
// core/seo — SitemapGenerator
//
// 책임:
//   - 사이트의 published 콘텐츠 목록으로 sitemap XML 생성
//   - 우선순위(priority) 및 changefreq 자동 산정
//
// 의존: core/content
// 비종속: framework 없음 (순수 함수)
// ============================================================

import { contentService } from '@core/content'

interface SitemapEntry {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
}

function buildEntry(entry: SitemapEntry): string {
  const parts: string[] = [`  <url>`, `    <loc>${entry.loc}</loc>`]
  if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod.split('T')[0]}</lastmod>`)
  if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`)
  if (entry.priority !== undefined) parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`)
  parts.push(`  </url>`)
  return parts.join('\n')
}

export const sitemapGenerator = {
  /**
   * Supabase에서 published 콘텐츠를 가져와 sitemap XML 문자열을 반환합니다.
   */
  async generate(siteId: string, baseUrl: string): Promise<string> {
    const { data } = await contentService.getList({
      siteId,
      status: 'published',
      limit: 1000,
      offset: 0,
      orderBy: 'publishedAt',
    })

    const entries: SitemapEntry[] = [
      // 홈페이지
      {
        loc: baseUrl,
        changefreq: 'daily',
        priority: 1.0,
      },
    ]

    for (const item of data?.items ?? []) {
      const slug = item.type === 'post' ? `blog/${item.slug}` : item.slug
      entries.push({
        loc: `${baseUrl}/${slug}`,
        lastmod: item.publishedAt ?? item.updatedAt,
        changefreq: item.type === 'post' ? 'weekly' : 'monthly',
        priority: item.type === 'post' ? 0.8 : 0.6,
      })
    }

    return [
      `<?xml version="1.0" encoding="UTF-8"?>`,
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
      ...entries.map(buildEntry),
      `</urlset>`,
    ].join('\n')
  },
}
