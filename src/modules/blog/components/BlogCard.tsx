import { Link } from 'react-router-dom'
import type { BlogPost } from '../types/blog.types'

interface BlogCardProps {
  post: BlogPost
  basePath?: string
}

export function BlogCard({ post, basePath = '/blog' }: BlogCardProps) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <article className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white">
      <Link to={`${basePath}/${post.slug}`}>
        <h2 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
          {post.title}
        </h2>
      </Link>
      {post.meta.description && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-3">
          {post.meta.description}
        </p>
      )}
      {date && (
        <time className="mt-4 block text-xs text-gray-400">{date}</time>
      )}
      {post.meta.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {post.meta.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-blue-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
