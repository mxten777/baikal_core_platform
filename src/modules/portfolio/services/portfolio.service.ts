import { contentService } from '@core/content'
import type { ApiResult } from '@/types'
import type { Project, PortfolioListOptions } from '../types/portfolio.types'

export const portfolioService = {
  async getProjects(
    opts: PortfolioListOptions,
  ): Promise<ApiResult<{ items: Project[]; total: number }>> {
    const pageSize = opts.pageSize ?? 12
    const offset = ((opts.page ?? 1) - 1) * pageSize

    const { data, error } = await contentService.getList({
      siteId: opts.siteId,
      type: 'project',
      status: 'published',
      limit: pageSize,
      offset,
      orderBy: 'createdAt',
    })

    if (error) return { data: null, error }
    return {
      data: {
        items: (data?.items ?? []) as Project[],
        total: data?.total ?? 0,
      },
      error: null,
    }
  },

  async getProjectBySlug(
    siteId: string,
    slug: string,
  ): Promise<ApiResult<Project>> {
    const { data, error } = await contentService.getBySlug(siteId, slug)
    if (error || !data) return { data: null, error: error ?? { code: 'NOT_FOUND', message: 'Project not found' } }
    return { data: data as Project, error: null }
  },
}
