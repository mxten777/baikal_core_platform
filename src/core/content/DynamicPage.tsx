// ============================================================
// core/content/DynamicPage.tsx
//
// 책임:
//   - URL slug를 기반으로 CMS contents 테이블의 'page' 타입 콘텐츠를 렌더링
//   - 전 사이트 공통 동작 (template 비종속)
//   - 404 처리 포함
// ============================================================

import { useParams } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { SeoHead } from '@core/seo'
import { seoService } from '@core/seo'
import { NotFound } from '@core/ui'
import { useContentBySlug } from './useContent'

export function DynamicPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { site } = useRuntime()
  const { content, loading, error } = useContentBySlug(site.siteId, slug)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-gray-400 text-sm">불러오는 중...</span>
      </div>
    )
  }

  if (error || !content) return <NotFound />

  const meta = seoService.buildMeta({ site, content, path: `/${slug}` })

  return (
    <>
      <SeoHead meta={meta} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">{content.title}</h1>
        {content.body ? (
          <div className="prose prose-gray max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {content.body}
            </p>
          </div>
        ) : (
          <p className="text-gray-400">내용이 없습니다.</p>
        )}
      </article>
    </>
  )
}
