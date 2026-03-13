// ============================================================
// templates/expert/pages/ExpertHomePage.tsx
//
// Expert 사이트 홈 — Full-screen Hero + 간략 소개 섹션
// ============================================================

import { Link } from 'react-router-dom'
import { useRuntime } from '@core/runtime'
import { SeoHead } from '@core/seo'
import { seoService } from '@core/seo'

export function ExpertHomePage() {
  const { site } = useRuntime()
  const meta = seoService.buildMeta({ site, path: '/' })

  return (
    <>
      <SeoHead meta={meta} />

      {/* Full-screen Hero */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center px-4 text-center">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-500 mb-4">
          {site.type}
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
          {site.meta.title}
        </h1>
        <p className="mt-6 text-lg text-gray-400 max-w-xl">
          {site.meta.description}
        </p>
        <div className="mt-12 flex items-center gap-6">
          {site.features.portfolio && (
            <Link
              to="/portfolio"
              className="text-sm tracking-widest uppercase text-white border border-white/30 px-6 py-3 hover:bg-white hover:text-gray-950 transition-colors"
            >
              Works
            </Link>
          )}
          {site.features.contact && (
            <Link
              to="/contact"
              className="text-sm tracking-widest uppercase text-gray-400 hover:text-white transition-colors"
            >
              Contact
            </Link>
          )}
        </div>
      </section>

      {/* About 요약 */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-gray-500 mb-3">About</p>
            <h2 className="text-2xl font-bold text-white">
              {site.name}
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              {site.meta.description}
            </p>
          </div>
          <div className="flex flex-col gap-3">
            {site.meta.keywords.map((kw) => (
              <span
                key={kw}
                className="text-xs tracking-widest uppercase text-gray-500 border-l border-white/10 pl-4"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
