import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useRuntime } from '@core/runtime'
import { SeoHead, seoService } from '@core/seo'
import { portfolioService } from '../services/portfolio.service'
import type { Project } from '../types/portfolio.types'

export function PortfolioDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { site } = useRuntime()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    portfolioService.getProjectBySlug(site.siteId, slug).then(({ data, error: err }) => {
      if (err) setError(err.message)
      else setProject(data)
      setLoading(false)
    })
  }, [site.siteId, slug])

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">불러오는 중...</div>
  if (error || !project) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-red-400">프로젝트를 찾을 수 없습니다.</div>

  const meta = seoService.buildMeta({
    site,
    content: project,
    path: `/portfolio/${project.slug}`,
  })

  return (
    <>
      <SeoHead meta={meta} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        {/* Back */}
        <Link
          to="/portfolio"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-10 transition-colors"
        >
          ← Works
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">{project.title}</h1>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {project.client && (
              <span className="text-xs px-2 py-1 bg-gray-800 text-gray-300 rounded">
                Client: {project.client}
              </span>
            )}
            {project.stack?.map((tech) => (
              <span key={tech} className="text-xs px-2 py-1 bg-gray-800 text-blue-300 rounded font-mono">
                {tech}
              </span>
            ))}
          </div>

          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              프로젝트 보러가기 ↗
            </a>
          )}
        </header>

        {/* Body */}
        {project.body ? (
          <div className="prose prose-invert prose-gray max-w-none">
            <p className="whitespace-pre-wrap text-gray-300 leading-relaxed">
              {project.body}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">프로젝트 설명이 없습니다.</p>
        )}
      </article>
    </>
  )
}
