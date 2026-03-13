import { useEffect, useState } from 'react'
import type { BlogPost, BlogListOptions } from '../types/blog.types'
import { blogService } from '../services/blog.service'

export function useBlogPosts(opts: BlogListOptions) {
  const [items, setItems] = useState<BlogPost[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    blogService.getPosts(opts).then(({ data, error: err }) => {
      if (err) setError(err.message)
      else {
        setItems(data?.items ?? [])
        setTotal(data?.total ?? 0)
      }
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(opts)])

  return { items, total, loading, error }
}
