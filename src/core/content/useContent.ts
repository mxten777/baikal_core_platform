// ============================================================
// core/content — useContent Hook
// ============================================================

import { useEffect, useState } from 'react'
import type { Content, ContentStatus } from '@/types'
import { contentService, type ContentListOptions } from './content.service'

export function useContent(opts: ContentListOptions) {
  const [items, setItems] = useState<Content[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    contentService.getList(opts).then(({ data, error: err }) => {
      if (err) {
        setError(err.message)
      } else {
        setItems(data?.items ?? [])
        setTotal(data?.total ?? 0)
      }
      setLoading(false)
    })
    // opts를 JSON 직렬화해서 deep compare
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(opts)])

  return { items, total, loading, error }
}

export function useContentBySlug(
  siteId: string,
  slug: string,
  status: ContentStatus = 'published',
) {
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    contentService.getBySlug(siteId, slug, status).then(({ data, error: err }) => {
      if (err) setError(err.message)
      else setContent(data)
      setLoading(false)
    })
  }, [siteId, slug, status])

  return { content, loading, error }
}
