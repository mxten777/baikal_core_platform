import { useRuntime } from '@core/runtime'
import { useBlogPosts } from '../hooks/useBlogPosts'
import { BlogCard } from '../components/BlogCard'

export function BlogListPage() {
  const { site } = useRuntime()
  const { items, loading, error } = useBlogPosts({ siteId: site.siteId })

  if (loading) return <div className="p-8 text-gray-400">불러오는 중...</div>
  if (error) return <div className="p-8 text-red-400">{error}</div>

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">블로그</h1>
      {items.length === 0 ? (
        <p className="text-gray-400">등록된 포스트가 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  )
}
