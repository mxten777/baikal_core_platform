import { useEffect, useState } from 'react'
import { portfolioService } from '../services/portfolio.service'
import type { Project, PortfolioListOptions } from '../types/portfolio.types'

export function useProjects(opts: PortfolioListOptions) {
  const [items, setItems] = useState<Project[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    portfolioService.getProjects(opts).then(({ data, error: err }) => {
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
