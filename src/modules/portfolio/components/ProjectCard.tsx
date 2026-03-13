import { Link } from 'react-router-dom'
import type { Project } from '../types/portfolio.types'

interface ProjectCardProps {
  project: Project
  basePath?: string
}

export function ProjectCard({ project, basePath = '/portfolio' }: ProjectCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/30 transition-all">
      <Link to={`${basePath}/${project.slug}`} className="block p-6">
        <h2 className="text-base font-semibold text-white group-hover:text-gray-200 line-clamp-2">
          {project.title}
        </h2>
        {project.meta.description && (
          <p className="mt-2 text-sm text-gray-400 line-clamp-2">
            {project.meta.description}
          </p>
        )}
        {project.stack && project.stack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs rounded bg-white/10 text-gray-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </Link>
    </article>
  )
}
