import { useRuntime } from '@core/runtime'
import { useProjects } from '../hooks/useProjects'
import { ProjectCard } from './ProjectCard'

export function PortfolioListPage() {
  const { site } = useRuntime()
  const { items, loading, error } = useProjects({ siteId: site.siteId })

  if (loading) return <div className="p-8 text-gray-400">불러오는 중...</div>
  if (error) return <div className="p-8 text-red-400">{error}</div>

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-2xl font-bold text-white tracking-tight mb-10 uppercase">
        Works
      </h1>
      {items.length === 0 ? (
        <p className="text-gray-500">등록된 프로젝트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  )
}
