// ============================================================
// core/seo — SEO Service
//
// 책임:
//   - SeoMeta 생성 (콘텐츠 + 사이트 설정 기반)
//   - 구조화 데이터(JSON-LD) 생성
//   - 사이트맵 데이터 제공
//   - robots.txt 규칙 정의
//
// 의존: types (SeoMeta, SiteConfig, Content)
// 비종속: React 컴포넌트 의존 없음 (순수 함수)
// ============================================================

import type { SeoMeta, SiteConfig, Content } from '@/types'

// ------ SeoMeta 생성 ------

export interface BuildSeoMetaOptions {
  site: SiteConfig
  content?: Content
  path?: string
}

export const seoService = {
  /**
   * 페이지 SeoMeta를 생성합니다.
   * content가 있으면 콘텐츠 메타를 우선 적용합니다.
   */
  buildMeta(opts: BuildSeoMetaOptions): SeoMeta {
    const { site, content, path = '' } = opts
    const canonical = `https://${site.domain}${path}`

    if (content) {
      return {
        title: content.meta.title ?? content.title,
        description: content.meta.description ?? site.meta.description,
        canonical,
        ogTitle: content.meta.title ?? content.title,
        ogDescription: content.meta.description ?? site.meta.description,
        ogImage: content.meta.ogImage ?? site.meta.ogImage,
        noIndex: content.status !== 'published',
        structuredData: this.buildArticleJsonLd(content, site),
      }
    }

    return {
      title: site.meta.title,
      description: site.meta.description,
      canonical,
      ogTitle: site.meta.title,
      ogDescription: site.meta.description,
      ogImage: site.meta.ogImage,
      noIndex: false,
      structuredData: this.buildWebsiteJsonLd(site),
    }
  },

  /**
   * Website 구조화 데이터 (홈 페이지용)
   */
  buildWebsiteJsonLd(site: SiteConfig): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.meta.title,
      url: `https://${site.domain}`,
      description: site.meta.description,
    }
  },

  /**
   * Article 구조화 데이터 (콘텐츠 페이지용)
   */
  buildArticleJsonLd(
    content: Content,
    site: SiteConfig,
  ): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: content.title,
      description: content.meta.description ?? '',
      datePublished: content.publishedAt,
      dateModified: content.updatedAt,
      publisher: {
        '@type': 'Organization',
        name: site.name,
        url: `https://${site.domain}`,
      },
    }
  },

  /**
   * robots.txt 규칙을 반환합니다.
   */
  buildRobotsTxt(site: SiteConfig): string {
    const lines = [
      'User-agent: *',
      `Sitemap: https://${site.domain}/sitemap.xml`,
      '',
      '# BAIKAL Core Platform',
      'Disallow: /admin/',
      'Disallow: /api/',
    ]
    return lines.join('\n')
  },
}
