// ============================================================
// templates/corporate/pages/CorporateHomePage.tsx
//
// Corporate 사이트 홈 — Hero + Features + CTA 섹션
// 콘텐츠는 SiteConfig 기반 (하드코딩 없음)
// ============================================================

import { Link } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { SeoHead } from '@core/seo'
import { seoService } from '@core/seo'

export function CorporateHomePage() {
  const { site } = useRuntime()
  const meta = seoService.buildMeta({ site, path: '/' })

  const enabledModules = [
    site.features.blog && { label: '블로그', to: '/blog', desc: '최신 소식과 기술 아티클을 확인하세요.' },
    site.features.portfolio && { label: '포트폴리오', to: '/portfolio', desc: '주요 프로젝트를 소개합니다.' },
    site.features.contact && { label: '문의하기', to: '/contact', desc: '궁금한 점이 있으시면 연락주세요.' },
  ].filter(Boolean) as { label: string; to: string; desc: string }[]

  return (
    <>
      <SeoHead meta={meta} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            {site.meta.title}
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-2xl">
            {site.meta.description}
          </p>
          {site.features.contact && (
            <div className="mt-10">
              <Link
                to="/contact"
                className="inline-block px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                문의하기
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features — 활성 모듈 기반 */}
      {enabledModules.length > 0 && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
              서비스
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {enabledModules.map((mod) => (
                <Link
                  key={mod.to}
                  to={mod.to}
                  className="group p-8 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                    {mod.label}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{mod.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
