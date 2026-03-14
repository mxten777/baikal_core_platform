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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.siteId, opts.type, opts.status, opts.tag, opts.topic, opts.limit, opts.offset, opts.orderBy, opts.order])

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
