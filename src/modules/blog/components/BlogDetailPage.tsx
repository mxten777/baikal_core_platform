import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useRuntime } from '@core/runtime'
import { SeoHead } from '@core/seo'
import { seoService } from '@core/seo'
import { blogService } from '../services/blog.service'
import type { BlogPost } from '../types/blog.types'

export function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { site } = useRuntime()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    blogService.getPostBySlug(site.siteId, slug).then(({ data, error: err }) => {
      if (err) setError(err.message)
      else setPost(data)
      setLoading(false)
    })
  }, [site.siteId, slug])

  if (loading) return <div className="p-8 text-gray-400">불러오는 중...</div>
  if (error || !post) return <div className="p-8 text-red-400">포스트를 찾을 수 없습니다.</div>

  const meta = seoService.buildMeta({
    site,
    content: post,
    path: `/blog/${post.slug}`,
  })

  return (
    <>
      <SeoHead meta={meta} />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{post.title}</h1>
          {post.publishedAt && (
            <time className="mt-3 block text-sm text-gray-400">
              {new Date(post.publishedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
        </header>
        {post.body ? (
          <div className="prose prose-gray max-w-none">
            {/* body는 Markdown 또는 rich JSON. 현재는 plain text 렌더링 */}
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {post.body}
            </p>
          </div>
        ) : (
          <p className="text-gray-400">내용이 없습니다.</p>
        )}
      </article>
    </>
  )
}
